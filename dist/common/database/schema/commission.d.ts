export declare const commissionSettingsTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "admin_settings";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "admin_settings";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        basicRate: import("drizzle-orm/pg-core").PgColumn<{
            name: "basic_plan_commission";
            tableName: "admin_settings";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        proRate: import("drizzle-orm/pg-core").PgColumn<{
            name: "pro_plan_commission";
            tableName: "admin_settings";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        premiumRate: import("drizzle-orm/pg-core").PgColumn<{
            name: "premium_plan_commission";
            tableName: "admin_settings";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "admin_settings";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type CommissionSettings = typeof commissionSettingsTable.$inferSelect;
export type NewCommissionSettings = typeof commissionSettingsTable.$inferInsert;
