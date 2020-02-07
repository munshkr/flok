import React, { MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type Props = {
  icon: IconProp;
  onClick: (e: MouseEvent) => void;
};

const Button = ({ icon, onClick }: Props) => (
  <a onClick={onClick}>
    <FontAwesomeIcon icon={icon} />
  </a>
);

export default Button;
