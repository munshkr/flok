import React, { memo } from "react";

type Props = {
  fullscreen?: boolean;
};

const HydraCanvas = React.forwardRef(
  (props: Props, ref: React.RefObject<HTMLCanvasElement>) => {
    const { fullscreen } = props;
    const className: string = fullscreen ? "fullscreen" : "";

    console.log("Hydra canvas rendered");

    return (
      <>
        <canvas ref={ref} className={className} width={1280} height={720} />
        <style jsx>
          {`
            canvas {
              position: absolute;
              top: 0;
              left: 0;
              z-index: -1;
            }
            .fullscreen {
              height: 100%;
              width: 100%;
              display: block;
              overflow: hidden;
            }
          `}
        </style>
      </>
    );
  }
);

export default memo(HydraCanvas);
