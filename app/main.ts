import loadConfig from "./adapters/inbound/config/load";
import RedisServer from "./adapters/inbound/redis-protocol/redis_server";

const config = loadConfig();

const redisServer = new RedisServer(config);

redisServer.start();
