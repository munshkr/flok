const Button = (props) => (
  <>
    <button {...props} />
    <style jsx>{`
      button {
        background-color: #2366d1;
        color: #fff;
        border-color: transparent;
        font-size: 1.5em;
        padding: 0.5em 0.75em;
        border-radius: 4px;
        margin-bottom: 0.75rem;
        cursor: pointer;
      }
      button:hover {
        background-color: #276cda;
      }
    `}</style>
  </>
);

export default Button;
