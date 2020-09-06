const Checkbox = ({ children, ...props }) => (
  <div>
    <label className="checkbox">
      <input type="checkbox" {...props} />
      {children}
    </label>
    <style jsx>{`
      div {
        margin-bottom: 0.75rem;
      }
      input {
        margin-right: 0.375rem;
      }
    `}</style>
  </div>
);

export default Checkbox;
