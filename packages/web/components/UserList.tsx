import React from "react";

type Props = {
  users?: {
    id: string;
    name: string;
  }[];
};

const UserList = ({ users }: Props) => (
  <div className="users-list">
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  </div>
);

UserList.defaultProps = {
  users: []
};

export default UserList;
