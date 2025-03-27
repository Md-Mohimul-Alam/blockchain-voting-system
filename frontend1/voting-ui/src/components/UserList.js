import React from "react";

const UserList = ({ users }) => {
  return (
    <div>
      <h3>User List</h3>
      {users.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>DID</th>
              <th>User ID</th>
              <th>District</th>
              <th>Role</th>
              <th>Has Voted</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.did}>
                <td>{user.did}</td>
                <td>{user.userId}</td>
                <td>{user.district}</td>
                <td>{user.role}</td>
                <td>{user.hasVoted ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default UserList;
