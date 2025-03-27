import React from "react";

const CloseElection = () => {
  const handleCloseElection = () => {
    alert("Election Closed!");
  };

  return (
    <div>
      <h4>Close Election</h4>
      <button onClick={handleCloseElection}>Close Election</button>
    </div>
  );
};

export default CloseElection;
