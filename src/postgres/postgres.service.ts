import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { DbDataService } from 'src/db-data/db-data.service';
import { Db, DbData } from 'src/db-data/entity/db-data.entity';
import { TokenService } from 'src/token/token.service';
import { PostgresDAO } from './postgres.dao';
import { SqlRequest } from 'src/db-requests/sqlRequest';

@Injectable()
export class PostgresService {
    constructor(
        private tokenService: TokenService,
        private dbDataService: DbDataService,
        private dao: PostgresDAO,
    ) {}

    async saveDbData(req: Request) {
        const uuid = await this.tokenService.getUUID(
            await this.tokenService.extractTokenFromHeader(req)
        );
        const data = req.body;
        await this.dbDataService.save(uuid, data, Db.PostgreSQL);
    }

    async select(req: Request) {
        const { db, sqlReq } = await this.getQuery(req);
        return await this.dao.select(db, sqlReq);
    }

    async insert(req: Request) {
        const { db, sqlReq } = await this.getQuery(req);
        return await this.dao.insert(db, sqlReq);
    }

    async update(req: Request) {
        const { db, sqlReq } = await this.getQuery(req);
        return await this.dao.update(db, sqlReq);
    }

    async delete(req: Request) {
        const { db, sqlReq } = await this.getQuery(req);
        return await this.dao.delete(db, sqlReq);
    }

    async custom(req: Request) {
        const { db, sqlReq } = await this.getQuery(req);
        return await this.dao.custom(db, sqlReq);
    }

    private async getQuery(req: Request) {
        const token = await this.tokenService.extractTokenFromHeader(req);
        const sqlReq: SqlRequest = req.body;
        const db = await this.getDb(await this.tokenService.getUUID(token), sqlReq.database);

        return { db, sqlReq };
    }

    private async getDb(uuid: string, dbName: string): Promise<DbData> {
        const postgresData = await this.dbDataService.findByUserAndDb(uuid, Db.PostgreSQL);

        const found = postgresData.find(db => {
            if(db.data["connection_data"]) {
                return db.data["connection_data"]["database"] === dbName;
            }
            else {
                return db.data["connection_string"].split("/")[3] === dbName;
            }
        });
        if(!found) {
            throw new NotFoundException("Can't find database with name '" + dbName + "'");
        }

        return found;
    }
}
