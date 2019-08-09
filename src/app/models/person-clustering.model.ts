export class Roi {
    x: number;
    width: number;
    y: number;
    height: number;
}

export class FullframeRoi {
    x: number;
    width: number;
    y: number;
    height: number;
}

export class Eyes {
    right_y: number;
    left_x: number;
    right_x: number;
    left_y: number;
}

export class ByteArray {
    $binary: string;
    $type: string;
}

export class CustomData {
    eyes: Eyes;
}

export class P1BestShots {
    track_timeStopUTC: any;
    format: string;
    fullframeFormat: string;
    roi: Roi;
    objectType: string;
    quality: number;
    fullframeHeight: number;
    fullframeRoi: FullframeRoi;
    width: number;
    trackletID: number;
    case_id: string;
    provider_id: string;
    track_timeStartUTC: any;
    _id: string;
    camera_UUID: string;
    serviceId: string;
    video_UUID: string;
    absolute_timeUTC: any;
    custom_data: CustomData;
    live: boolean;
    height: number;
    fullframeWidth: number;
    bytearray: ByteArray;
}

export class P1AssociatedBestShots {
    track_timeStopUTC: any;
    format: string;
    fullframeFormat: string;
    roi: Roi;
    objectType: string;
    quality: number;
    fullframeHeight: number;
    fullframeRoi: FullframeRoi;
    width: number;
    trackletID: number;
    case_id: string;
    provider_id: string;
    track_timeStartUTC: any;
    _id: string;
    camera_UUID: string;
    serviceId: string;
    video_UUID: string;
    absolute_timeUTC: any;
    custom_data: CustomData;
    live: boolean;
    height: number;
    fullframeWidth: number;
    bytearray: ByteArray;
}

export class RootObject {
    P1_BestShots: P1BestShots[];
    person1: string;
    P1_associatedBestShots: P1AssociatedBestShots[];
}

