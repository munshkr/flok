const HydraError = ({ children }) => (
  <>
    <span className="error">{children}</span>
    <style jsx>
      {`
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
  </>
);

export default HydraError;