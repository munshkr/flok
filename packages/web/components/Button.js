import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ icon, ...props }) => (
  <a {...props}>
    <FontAwesomeIcon icon={icon} />
  </a>
);

Button.propTypes = {
  icon: FontAwesomeIcon.propTypes.icon.isRequired
};

export default Button;
