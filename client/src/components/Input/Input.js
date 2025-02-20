import React from "react";
import "./Input.css";

const Input = ({ setMessage, sendMessage, message }) => {
    console.log(message)
  return (
    <form className="form" onSubmit={(e) => sendMessage(e)}>
      <input
        className="input"
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={({ target: { value } }) => setMessage(value)}
        onKeyDown={(event) =>
          event.key === "Enter" ? sendMessage(event) : null
        }
      />
      <button className="sendButton" type="submit">
        Send
      </button>
    </form>
  );
};
export default Input;
