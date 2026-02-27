// @services/connectToDatabase.ts
import { ApiResponse, errorResponse, failedResponse } from "@utils/common";
import { Prisma } from "@prisma/client";

export function handleQueryError(err: unknown, path: string):Partial<ApiResponse> {
    // 1. Handle Known Prisma Errors (Logic Errors)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        
        // P2002: if entry aleardy exists.
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[]) || ['field'];
            return failedResponse({
                statusCode: 409, // Conflict
                message: `${target.join(', ')} already exists.`,
                path:path,
                data: { code: err.code, meta: err.meta }
            });
        }

        // P2025: Record not found 
        if (err.code === 'P2025') {
            return failedResponse({
                statusCode: 404, 
                message: "Record not found or access denied.",
                path:path,
                data: { code: err.code }
            });
        }
        
        // Other Prisma logic errors
        return errorResponse({
            statusCode: 400,
            message: "Database operation failed.",
            path:path,
            error: err.code
        });
    }

    // 2. if can't connect.
    if (err instanceof Prisma.PrismaClientInitializationError) {
        return errorResponse({
            statusCode: 503, // Service Unavailable
            message: "Could not connect to the database. Please try again later.",
            path:path
        });
    }

    // 3. Handle Generic Errors.
    const errorMessage = err instanceof Error ? err.message : "Unknown system error";
    return errorResponse({
        statusCode: 500,
        message: "Internal Server Error",
        path:path,
        error: errorMessage
    });
}