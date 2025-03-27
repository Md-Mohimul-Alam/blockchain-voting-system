import React from "react";

const ResetElection = () => {
  const handleResetElection = () => {
    alert("Election Reset!");
  };

  return (
    <div>
      <h5>Reset Election</h5>
      <button onClick={handleResetElection}>Reset Election</button>
    </div>
  );
};

export default ResetElection;
