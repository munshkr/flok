import { Component, Fragment } from "react";
import dynamic from "next/dynamic";
import SessionClient from "../lib/SessionClient";

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false
});

const Row = ({ editors, isHalfHeight, sessionClient, onEvaluateCode }) => (
  <div className="columns is-multiline">
    {editors.map(({ id, target }) => (
      <div key={id} className={`column is-${12 / editors.length}`}>
        <TextEditor
          editorId={id}
          target={target}
          isHalfHeight={isHalfHeight}
          sessionClient={sessionClient}
          onEvaluateCode={onEvaluateCode}
        />
      </div>
    ))}
  </div>
);

type Props = {
  layout: any;
  sessionClient: SessionClient;
  onEvaluateCode: any;
};

class Mosaic extends Component<Props> {
  editorsByRows() {
    const { editors } = this.props.layout;
    let editorsByRows = [];

    switch (editors.length) {
      case 1:
      case 2:
        editorsByRows = [editors];
        break;
      case 3:
        editorsByRows = [editors.slice(0, 2), [editors[2]]];
        break;
      case 4:
        editorsByRows = [editors.slice(0, 2), editors.slice(2, 4)];
        break;
      case 5:
        editorsByRows = [editors.slice(0, 3), editors.slice(3, 5)];
        break;
      case 6:
        editorsByRows = [editors.slice(0, 3), editors.slice(3, 6)];
        break;
      case 7:
        editorsByRows = [editors.slice(0, 4), editors.slice(4, 7)];
        break;
      case 8:
        editorsByRows = [editors.slice(0, 4), editors.slice(4, 8)];
        break;
      default:
        alert("More than 8 slots are not supported right now. Sorry!");
    }

    return editorsByRows;
  }

  render() {
    const { sessionClient, onEvaluateCode } = this.props;

    const rows = this.editorsByRows();

    return (
      <Fragment>
        {rows.map(editors => (
          <Row
            editors={editors}
            sessionClient={sessionClient}
            onEvaluateCode={onEvaluateCode}
            isHalfHeight={rows.length === 2}
          />
        ))}
      </Fragment>
    );
  }
}

export default Mosaic;
