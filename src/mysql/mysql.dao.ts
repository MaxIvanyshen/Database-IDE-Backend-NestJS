import { SqlQueryConstructor } from "../sqlTools/sqlQueryConstructor";
import { DbData } from 'src/db-data/entity/db-data.entity';
import { InternalServerErrorException } from '@nestjs/common';
import * as mysql from "mysql";
import { SqlRequest } from 'src/db-requests/sqlRequest';
import { promisify } from "util";

export class MysqlDAO {
    private client: any = null;

    public async connectToDB(dbData: DbData) {
        this.client = mysql.createConnection(dbData.data["connection_data"]);
        this.client.connect((err: any) => {
            if(err) {
                throw err;
            }
        });
    }

    public async insert(db: DbData, req: SqlRequest) {
        await this.connectToDB(db);
        try {
            const query = promisify(this.client.query).bind(this.client);
            await query(SqlQueryConstructor.makeInsertionQueryStr(req.data, req.table));
        } catch(err: any) {
            throw new InternalServerErrorException("couldn't insert into database");
        } finally {
            this.client.end();
        }
    } 

    public async select(db: DbData, req: SqlRequest) {
        await this.connectToDB(db);
        try {
            const query = promisify(this.client.query).bind(this.client);
            return await query(SqlQueryConstructor.makeSelectionQueryStr(req.data, req.table));
        } catch(err: any) {
            throw new InternalServerErrorException("couldn't insert into database");
        } finally {
            this.client.end();
        }
    } 

    public async delete(db: DbData, req: SqlRequest) {
        await this.connectToDB(db);
        try {
            const query = promisify(this.client.query).bind(this.client);
            await query(SqlQueryConstructor.makeDeletionQueryStr(req.data, req.table));
        } catch(err: any) {
            throw new InternalServerErrorException("couldn't delete from database");
        } finally {
            this.client.end();
        }
    }

    public async update(db: DbData, req: SqlRequest) {
        await this.connectToDB(db);
        try {
            const query = promisify(this.client.query).bind(this.client);
            await query(SqlQueryConstructor.makeUpdateQueryStr(req.data, req.table));
        } catch(err: any) {
            throw new InternalServerErrorException("couldn't update database");
        } finally {
            this.client.end();
        }
    }

    public async custom(db: DbData, req: SqlRequest) {
        await this.connectToDB(db);
        try {
            const query = promisify(this.client.query).bind(this.client);
            return await query(req.data["query"]);
        } catch(err: any) {
            throw new InternalServerErrorException("couldn't update database");
        } finally {
            this.client.end();
        }
    }
}
