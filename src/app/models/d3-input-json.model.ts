export class Roi{

}
export class FullFrameRoi{

}

export class Link{
    source: any;
    target: any;
}

export class Node{
    id: any;
    imgByteCode: string;
    fullFrameWidth: number;
    fullFrameHeight: number;
    width: number;
    height: number;
    roi: Roi;
    fullFrameRoi: FullFrameRoi;
}

export class D3InputJson{
    links: Link[];
    nodes: Node[];
}