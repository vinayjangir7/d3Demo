import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RootObject } from '../../models/person-clustering.model';
import * as jsonData from '../../../assets/result.json';
import { D3InputJson, Link, Node, FullFrameRoi, Roi } from '../../models/d3-input-json.model';
import * as d3 from 'd3';
import { Selection, SimulationNodeDatum, text } from 'd3';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.css']
})
export class GraphViewComponent implements OnInit {
  public pcModel = new RootObject();
  private w: number = 1000;
  private h: number = 600;
  private node: any;
  private nodeEnter: any;
  private link: any;
  private linkEnter: any;
  private labels: any;
  private root: any;
  private vis: any;
  public force: any;
  public circles: any;
  public lines: any;
  public images: any;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.pcModel.P1_BestShots = (<any>jsonData).P1_BestShots;
    this.pcModel.person1 = (<any>jsonData).person1;
    this.pcModel.P1_associatedBestShots = (<any>jsonData).P1_associatedBestShots;
    console.log(this.pcModel);
  }

  //Call this method in the image source, it will sanitize it.
  transform(base64Image: string) {
    let image = 'data:image/jpeg;base64,' + base64Image;
    return this.sanitizer.bypassSecurityTrustResourceUrl(image);
  }

  //to convert the input json to d3 json format
  tranformJson(inputJson: RootObject): D3InputJson {
    let outputJson: D3InputJson = {
      links: Link[0] = [],
      nodes: Node[0] = []
    }
    inputJson.P1_associatedBestShots.forEach((element, index) => {
      //add link objects
      let linkObject: Link;
      linkObject = this.mapLinkObject(inputJson.P1_BestShots[0]._id, element._id);
      outputJson.links.push(linkObject);

      //add node objects
      let nodeObject: Node;
      nodeObject = this.mapNodeObject(element._id, element.bytearray.$binary, element.fullframeWidth, element.fullframeHeight,
        element.width, element.height, element.roi, element.fullframeRoi, "Associate_" + index++);
      outputJson.nodes.push(nodeObject);
    });
    //add suspect node object from P1_BestShots array's first object
    let suspectNodeObject: Node;
    let suspectObj = inputJson.P1_BestShots[0];
    suspectNodeObject = this.mapNodeObject(suspectObj._id, suspectObj.bytearray.$binary, suspectObj.fullframeWidth, suspectObj.fullframeHeight,
      suspectObj.width, suspectObj.height, suspectObj.roi, suspectObj.fullframeRoi, "Suspect");
    outputJson.nodes.push(suspectNodeObject);

    return outputJson;
  }

  //to map node object
  mapNodeObject(id: string, imgByteCode: string, fullFrameWidth: number, fullFrameHeight: number, width: number, height: number,
    roi: Roi, fullFrameRoi: FullFrameRoi, name: string): Node {
    let node = new Node();
    node.id = id;
    node.imgByteCode = imgByteCode;
    node.fullFrameWidth = fullFrameWidth;
    node.fullFrameHeight = fullFrameHeight;
    node.width = width;
    node.height = height;
    node.roi = roi;
    node.fullFrameRoi = fullFrameRoi;
    node.name = name;
    return node;
  }

  //to map link object
  mapLinkObject(source: string, target: string): Link {
    let link = new Link();
    link.source = source;
    link.target = target;
    return link;
  }

  //d3js Graph implementation

  ngAfterContentInit() {

    this.vis = d3.select('#graph').append('svg')
      .attr('width', this.w)
      .attr('height', this.h);

    this.root = this.tranformJson(this.pcModel);
    console.log("d3_input_json ", this.root);

    //Create links as lines
    this.link = this.vis.append("g")
      .attr('class', 'edges')
      .selectAll("line")
      .data(this.root.links);

    this.linkEnter = this.link.enter()
    this.lines = this.linkEnter.append("line")
      .attr("stroke-width", 2)
      .attr("stroke", "#a5a5a5");

    //Create nodes as circles
    this.node = this.vis.append("g")
      .selectAll('circle')
      .data(this.root.nodes);

    this.nodeEnter = this.node.enter().append('g')
      .attr("class", "nodes")
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    this.nodeEnter.append("defs")
      .append("pattern")
      .attr("id", function (d) { if (d.id) return d.id; else null; })
      .attr("height", 1)
      .attr("width", 1)
      .attr("x", "0")
      .attr("y", "0")
      .append("image")
      .attr("id", function (d) { if (d.id) return "id" + d.id; else null; })
      .attr("height", 50)
      .attr("width", 50)
      .attr("x", function (d) { return -5; })
      .attr("y", function (d) { return -5; })
      .attr("xlink:href", function (d) { if (d.imgByteCode) return 'data:image/jpeg;base64,' + d.imgByteCode; else null; });

    // Append a circle
    this.circles = this.nodeEnter.append("circle")
      .attr("r", 20)
      .attr("stroke", "#a5a5a5")
      .style("stroke-width", 1)
      .attr("fill", function (d) { if (d.id) return "url(#" + d.id + ")"; else null; });

    // this.circles = this.nodeEnter.append('circle')
    //   .attr('r', 10)
    //   .style("fill", "#555555");


    // this.images = this.nodeEnter.append("image")
    //   .attr("xlink:href", function (d) { return 'data:image/jpeg;base64,' + d['imgByteCode']; })
    //   // .attr("xlink:href", "http://marvel-force-chart.surge.sh/marvel_force_chart_img/top_ironman.png")
    //   .attr("x", -25)
    //   .attr("y", -25)
    //   .attr("height", 50)
    //   .attr("width", 50);

    this.force = d3.forceSimulation(this.root.nodes)
      .force('link', d3.forceLink(this.root.links).distance(100).strength(0.3).id((d) => { return d['id']; }))
      .force('x', d3.forceX(this.w))
      .force('y', d3.forceY(this.h))
      .force('charge', d3.forceManyBody().strength(-1300))
      .force('center', d3.forceCenter(this.w / 2, this.h / 2));

    this.circles
      .on('mouseenter', (d, i, n) => {
        console.log("enter");
        // select element in current context
        const s = d3.select(n[i]).attr('fill');
        const id = s.slice(5, -1);
        const imageId = "#id" + id;
        const textId = "#text" + id;

        d3.select(n[i])
          .transition()
          .attr("r", 40);

        d3.select(imageId)
          .attr("x", function (d) { return -10 })
          .attr("y", function (d) { return -10 })
          .attr("height", 100)
          .attr("width", 100);

        d3.select(textId)
          .attr("x", function (d) { return 40 })
          .attr("y", function (d) { return 20 });

      })
      // set back
      .on('mouseleave', (d, i, n) => {
        console.log("leave");
        const s = d3.select(n[i]).attr('fill');
        const id = s.slice(5, -1);
        const imageId = "#id" + id;
        const textId = "#text" + id;

        d3.select(n[i])
          .transition()
          .attr("r", 20);

        d3.select(imageId)
          .attr("x", function (d) { return -5 })
          .attr("y", function (d) { return -5 })
          .attr("height", 50)
          .attr("width", 50);

        d3.select(textId)
          .attr("x", function (d) { return 20 })
          .attr("y", function (d) { return 10 })

      });
    this.nodeEnter
      .append("text")
      .attr("id", (d) => { return "text" + d.id; })
      .attr("x", 20)
      .attr("y", 10)
      .attr("fill", "black")
      .text((d) => { return d['name'] });

    // this.node.on('dblclick', () => {
    //   console.log("double click");
    //   d3.selectAll("circle").transition().style("fill", "green").duration(2000);
    //   d3.selectAll("line").transition().attr("stroke", "green").duration(2000);
    // })

    this.force.on('tick', () => {
      this.lines
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      this.vis.selectAll("g.nodes").attr("transform", (d) => {
        d.x = Math.max(6, Math.min(this.w - 6, d.x));
        d.y = Math.max(6, Math.min(this.h - 6, d.y));
        return "translate(" + d.x + "," + d.y + ")";
      });

      // this.nodeEnter
      //   .attr('cx', function (d) { return d.x; })
      //   .attr('cy', function (d) { return d.y; });

      // this.images
      //   .attr('cx', function (d) { return d.x; })
      //   .attr('cy', function (d) { return d.y; });

      // this.labels.attr('transform', function (d) {
      //   return 'translate(' + d.x + ',' + d.y + ')';
      // });
    })



    // function update() {
    //   // Restart the force layout
    //   this.force
    //     .nodes(this.root.nodes)
    //     .restart();

    //   // Update the links
    //   this.link = this.vis.selectAll('link.link')
    //     .data(this.root.links);

    //   // Enter any new links
    //   this.link.enter().append('svg:line')
    //     .attr('class', 'link')
    //     .attr('source', function (d) { return d.source; })
    //     .attr('target', function (d) { return d.target; });

    //   // Exit any old links
    //   this.link.exit().remove();

    //   // Update the nodes
    //   this.node = this.vis.selectAll('circle.node')
    //     .data(this.root.nodes);

    //   // Enter any new nodes
    //   this.node.enter().append('svg:circle')
    //     .attr('class', 'node')
    //     .attr('id', function (d) {
    //       return d.type + d.id;
    //     })
    //     .style('fill', "red")
    //     .attr('r', 5)
    //   // .on('mouseover', fade(true))
    //   // .on('mouseout', fade(false))
    //   //.call(force.drag);

    //   // Exit any old nodes
    //   this.node.exit().remove();

    //   // Build fast lookup of links
    //   let linkIndexes = {};
    //   this.root.links.forEach(function (d) {
    //     linkIndexes[d.source.index + ',' + d.target.index] = 1;
    //     linkIndexes[d.target.index + ',' + d.source.index] = 1;
    //   });

    //   // Build labels
    //   let labels = this.vis.selectAll('g.labelParent')
    //     .data(this.root.nodes);

    //   labels.enter().append('svg:g')
    //     .attr('class', 'labelParent');

    //   labels.exit().remove();

    //   // Init fade state
    //   //this.node.each(fade(false));
    // }

    // update();
  }



}
