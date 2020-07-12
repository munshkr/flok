import React, { MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Props {
  icon: IconProp;
  className?: string;
  onClick: (e: MouseEvent) => void;
}

const Button = ({ icon, className, onClick }: Props) => (
  <a className={className} onClick={onClick}>
    <FontAwesomeIcon icon={icon} />
    <style jsx>{`
      a {
        cursor: pointer;
      }
    `}</style>
  </a>
);

export default Button;
