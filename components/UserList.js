import React from "react";
import PropTypes from "prop-types";

const UserList = ({ users }) => (
  <div>
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
    <style jsx>
      {`
        div {
          position: absolute;
          top: 0;
          right: 0;
          background: transparent;
          font-size: 0.9em;
          text-align: right;
          color: #fefefe;
          z-index: 1000;
          font-family: monospace;
          font-style: italic;
        }

        ul {
          list-style-type: none;
          margin: 0;
        }
      `}
    </style>
  </div>
);

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object)
};

UserList.defaultProps = {
  users: []
};

export default UserList;
