import React from "react";
import PropTypes from "prop-types";

const UserList = ({ users }) => (
  <div className="users-list">
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  </div>
);

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object)
};

UserList.defaultProps = {
  users: []
};

export default UserList;
