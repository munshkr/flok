import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ icon, ...props }) => (
  <a {...props}>
    <FontAwesomeIcon icon={icon} />
  </a>
);

Button.propTypes = {
  icon: PropTypes.string.isRequired
};

export default Button;
