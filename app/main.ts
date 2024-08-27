import RedisServer from "./adapters/inbound/redis-protocol/redis_server";

const redisServer = new RedisServer();

redisServer.start();
