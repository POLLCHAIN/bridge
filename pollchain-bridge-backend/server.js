require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  generateDepositData,
  generateTransferData,
} = require("./src/utils/web3Helper");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/getDepositData", async (req, res) => {
  const { userAddress, amount, targetChainId, deadlineMinutes } = req.query;

  if (!userAddress || !amount || !targetChainId) {
    return res.status(400).send("Missing required parameters");
  }
  try {
    const data = await generateDepositData(
      userAddress,
      parseFloat(amount),
      parseInt(targetChainId),
      deadlineMinutes ? parseInt(deadlineMinutes) : 60
    );
    return res.json(data);
  } catch (error) {
    console.error("Error generating deposit data:", error);
    return res.status(500).send(error.message);
  }
});

app.get("/getTransferData", async (req, res) => {
  const { userAddress, amount, sourceChainId, deadlineMinutes, nonce } =
    req.query;

  if (!userAddress || !amount || !sourceChainId || !nonce) {
    return res.status(400).send("Missing required parameters");
  }
  try {
    const data = await generateTransferData(
      userAddress,
      parseFloat(amount),
      parseInt(nonce),
      parseInt(sourceChainId),
      deadlineMinutes ? parseInt(deadlineMinutes) : 60
    );
    return res.json(data);
  } catch (error) {
    console.error("Error generating transfer data:", error);
    return res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`PollChain Bridge Backend listening on port ${port}`);
});
