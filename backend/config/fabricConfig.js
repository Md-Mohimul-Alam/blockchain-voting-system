// fabric/fabricConnector.js
import pkg from "fabric-network";
const { Gateway, Wallets } = pkg;
import FabricCAServices from "fabric-ca-client";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import {
  buildCCPOrg1,
  buildWallet,
} from "../../blockchain/fabric-samples/test-application/javascript/AppUtil.js";
import {
  enrollAdmin,
  registerAndEnrollUser,
} from "../../blockchain/fabric-samples/test-application/javascript/CAUtil.js";

dotenv.config();

const ccp = buildCCPOrg1();
const channelName = process.env.FABRIC_CHANNEL || "mychannel";
const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || "voting-contract";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(process.cwd(), "wallet");
const org1UserId = "javascriptAppUser";

export async function getContract() {
  try {
    const caInfo = ccp.certificateAuthorities?.["ca.org1.example.com"];
    if (!caInfo) throw new Error("CA info missing in connection profile");

    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    const wallet = await buildWallet(Wallets, walletPath);
    await enrollAdmin(ca, wallet, mspOrg1);
    await registerAndEnrollUser(ca, wallet, mspOrg1, org1UserId, "org1.department1");

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    return { contract, gateway, network };
  } catch (error) {
    console.error("❌ Fabric connection failed:", error);
    throw error;
  }
}
