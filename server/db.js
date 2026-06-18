import mongoose from "mongoose";
import dns from "dns";
import https from "https";

// Helper to check the current public IP of the server
function getPublicIp() {
  return new Promise((resolve) => {
    const options = { timeout: 3000 };
    https.get("https://api.ipify.org", options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(data.trim()));
    }).on("error", () => {
      https.get("https://ifconfig.me", options, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => resolve(data.trim()));
      }).on("error", () => resolve(null));
    });
  });
}

// Helper to resolve SRV records using custom DNS (8.8.8.8)
function resolveSrvCustom(srvRecord) {
  return new Promise((resolve, reject) => {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    dns.resolveSrv(srvRecord, (err, addresses) => {
      if (err) return reject(err);
      resolve(addresses);
    });
  });
}

// Helper to resolve TXT records using custom DNS (8.8.8.8)
function resolveTxtCustom(domain) {
  return new Promise((resolve, reject) => {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    dns.resolveTxt(domain, (err, records) => {
      if (err) return reject(err);
      resolve(records);
    });
  });
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  console.log("Mongo URI:", uri ? "FOUND" : "NOT FOUND");

  if (!uri || uri === "your_mongodb_uri_here") {
    console.warn("⚠️ MongoDB URI is not set in .env");
    return;
  }

  // 1. Try standard connection
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB");
    return;
  } catch (err) {
    console.error("❌ MongoDB connection failed on initial attempt:", err.message);

    const isDnsError = err.message.includes("ECONNREFUSED") || 
                       err.message.includes("ENOTFOUND") || 
                       err.message.includes("querySrv");

    if (isDnsError) {
      console.log("\n⚠️ Detected DNS SRV resolution error. Attempting custom DNS recovery...");

      // Parse the domain and credentials from the URI
      const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
      if (match) {
        const username = match[1];
        const password = match[2];
        const clusterDomain = match[3];
        const dbName = match[4];
        const srvRecord = `_mongodb._tcp.${clusterDomain}`;

        try {
          console.log(`Resolving SRV records for ${clusterDomain} using Google DNS...`);
          const srvAddresses = await resolveSrvCustom(srvRecord);
          console.log(`Successfully resolved ${srvAddresses.length} shard(s)`);

          let optionsStr = "authSource=admin&ssl=true";
          try {
            const txtRecords = await resolveTxtCustom(clusterDomain);
            if (txtRecords && txtRecords.length > 0) {
              optionsStr = txtRecords[0].join("");
            }
          } catch (txtErr) {
            console.warn("Could not retrieve TXT records, using defaults.");
          }

          const shardHosts = srvAddresses.map(addr => `${addr.name}:${addr.port}`);

          // Build fallback URI (masked and unmasked)
          const unmaskedFallback = `mongodb://${username}:${password}@${shardHosts.join(",")}/${dbName}?${optionsStr}`;
          const maskedFallback = `mongodb://${username}:****@${shardHosts.join(",")}/${dbName}?${optionsStr}`;

          console.log(`Constructing fallback non-SRV URI: ${maskedFallback}`);
          console.log("Attempting connection via fallback URI...");

          try {
            await mongoose.connect(unmaskedFallback, { serverSelectionTimeoutMS: 5000 });
            console.log("✅ Successfully connected to MongoDB via non-SRV fallback URI!");
            return;
          } catch (fallbackErr) {
            console.error("❌ Connection failed via fallback URI:", fallbackErr.message);
          }
        } catch (dnsErr) {
          console.error("❌ Custom DNS recovery failed:", dnsErr.message);
        }
      }
    }

    // If both failed, present a detailed troubleshooting guide
    const publicIp = await getPublicIp();

    console.log("\n=================== MONGODB TROUBLESHOOTING GUIDE ===================");
    console.log("MongoDB connection failed. Please follow these steps:");
    console.log(`1. Your Current Public IP: ${publicIp || "Unknown (offline/timeout)"}`);
    console.log("   Make sure this IP is whitelisted in MongoDB Atlas under Network Access.");
    console.log("2. Network Restrictions / Port 27017 Blocked:");
    console.log("   Your local network (router, corporate firewall, or ISP) may be blocking");
    console.log("   outbound TCP traffic on port 27017.");
    console.log("3. Use the Non-SRV standard connection string fallback in your .env:");

    // Construct the manual suggestion template dynamically
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (match) {
      const username = match[1];
      const clusterDomain = match[3];
      // Resolve shard details dynamically from clusterDomain for suggestion
      const suffix = clusterDomain.replace("skillnova-db.", ""); // 20zh83e.mongodb.net
      console.log(`   MONGO_URI=mongodb://${username}:<PASSWORD>@ac-nbsvizz-shard-00-00.${suffix}:27017,ac-nbsvizz-shard-00-01.${suffix}:27017,ac-nbsvizz-shard-00-02.${suffix}:27017/skillnova?authSource=admin&replicaSet=atlas-102bug-shard-0&ssl=true`);
    } else {
      console.log("   MONGO_URI=mongodb://<USER>:<PASSWORD>@<SHARD-0>:27017,<SHARD-1>:27017,<SHARD-2>:27017/<DB>?authSource=admin&replicaSet=<REPLICA-SET>&ssl=true");
    }
    console.log("=====================================================================\n");
  }
}