import React, { memo } from "react";

type Props = {
  fullscreen?: boolean;
  error?: string;
};

const HydraCanvas = React.forwardRef((props: Props, ref: React.RefObject<HTMLCanvasElement>) => {
  const { fullscreen, error } = props;
  const className: string = fullscreen ? "fullscreen" : "";

  console.log("Hydra canvas rendered");

  return (
    <div>
      <canvas
        ref={ref}
        className={className}
        width={1280}
        height={720}
      />
      {error && <span className="error">{error}</span>}
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
          .error {
            font-family: monospace;
            position: absolute;
            bottom: 1em;
            left: 1em;
            background-color: #ff0000;
            color: #ffffff;
            padding: 2px 5px;
          }
        `}
      </style>
    </div>
  );
});

export default memo(HydraCanvas);
