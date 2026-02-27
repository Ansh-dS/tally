import { getToken } from "./cookies"
import { failedResponse,  successResponse, errorResponse, ApiResponse } from "@utils/common"
import { prismaClient } from '@db/client'
import resolveToken from "./jwt"
import { JwtPayload } from "jsonwebtoken"
import { handleQueryError } from "../utils/query-error"

export async function autherization(path: string):Promise<Partial<ApiResponse>>{
    const accesstoken = await getToken("jwtAccessToken")

    if (!accesstoken) return failedResponse({
        statusCode: 401,
        message: "Cant' find Access Token",
        path: path
    })

    // token exists so we are verify different cases there.
    const casesRes =  resolveToken({ token: accesstoken,type:'Access' , path: path })

    if (casesRes?.status === 'failed' || casesRes?.status === 'error') return casesRes

    // token verified: now check session exists in database or not.
    // we can use redis to stop is db call each time a user asking data from a page.
    
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                id: (casesRes.data as JwtPayload).userId
            }
        })
        if (!user) {
            return failedResponse({
                statusCode: 404,
                message: 'No User found',
                path: path
            })
        }
        return successResponse({
            statusCode: 200,
            message: 'Authorized',
            data: user
        })
    }
    catch (err) {
        return handleQueryError(err, path)
    }

    

    /*
    we don't need to 'check permissions' here:
        1. If the database says you exist and your token is valid
        2. you are automatically the "Owner" of:
                whatever you are about to create.
    */

    /*
    for edit/delete:
        must check the permissions.
    */

}

