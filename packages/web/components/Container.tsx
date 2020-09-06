const Container = ({ children }) => (
  <div>
    {children}
    <style jsx>{`
      div {
        flex-grow: 1;
        margin: 0 auto;
        width: auto;
        padding: 3rem 1.5rem;
      }

      @media screen and (min-width: 1216px) {
        div {
          max-width: 1152px;
        }
      }

      @media screen and (min-width: 1024px) {
        div {
          max-width: 960px;
        }
      }
    `}</style>
  </div>
);

export default Container;
