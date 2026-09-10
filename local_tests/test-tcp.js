import net from "net";

const shards = [
  { host: "ac-nbsvizz-shard-00-00.20zh83e.mongodb.net", ip: "89.192.8.232", port: 27017 },
  { host: "ac-nbsvizz-shard-00-01.20zh83e.mongodb.net", ip: "89.192.8.244", port: 27017 },
  { host: "ac-nbsvizz-shard-00-02.20zh83e.mongodb.net", ip: "89.192.8.239", port: 27017 }
];

async function checkTcp(shard) {
  return new Promise((resolve) => {
    console.log(`\nConnecting to ${shard.host} (${shard.ip}:${shard.port})...`);
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on("connect", () => {
      console.log(`✅ TCP Connection SUCCESS to ${shard.host} (${shard.ip})`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on("error", (err) => {
      console.error(`❌ TCP Connection FAILED to ${shard.host} (${shard.ip}): ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on("timeout", () => {
      console.error(`❌ TCP Connection TIMEOUT to ${shard.host} (${shard.ip})`);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(shard.port, shard.ip);
  });
}

async function run() {
  for (const shard of shards) {
    await checkTcp(shard);
  }
}

run();
