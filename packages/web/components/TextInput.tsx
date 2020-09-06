const TextInput = (props) => (
  <>
    <input type="text" {...props} />
    <style jsx>{`
      input {
        font-size: 1.5em;
        padding: 0.5em 0.75em;
        box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
        border-radius: 4px;
        border-color: #dbdbdb;
        max-width: 95%;
        width: 95%;
        margin-bottom: 0.75rem;
      }

      input:active,
      input:focus {
        border-color: #3273dc;
        box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
        outline: none;
      }
    `}</style>
  </>
);

export default TextInput;
