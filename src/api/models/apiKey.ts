import {Property, Model, Reference} from 'vulcain-corejs';

@Model({ storageName: "tokens" })
export class ApiKey
{
    @Property({type:"string", required:false, isKey:true})
    token:string;
    @Property({type:"arrayOf", item:"string", required: true})
    scopes:Array<string>;
    @Property({type:"string", required: true})
    description:string;
    @Property({type:"string", required: true})
    userId: string;
    @Property({type:"string", required: true})
    userName: string;
    @Property({ type: "string" })
    tenant: string;
    @Reference({item:"any", cardinality:"one"})
    data: any;
}

