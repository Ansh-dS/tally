import bcrypt from 'bcrypt';

const saltRounds = 10;

// generate a salt for hashing a password
async function createSalt(): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return salt;
    } catch (err) {
        console.log("can't create salt.");
        // Re-throw so callers can handle or return the error
        throw err;
    }
}

async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await createSalt();
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    } catch (err) {
        console.log("Can't hash the password.");
        throw err;
    }
}

export async function verifyPassword(
    password: string,
    storedHashedPassword: string
): Promise<boolean> {
    try {
        const result = await bcrypt.compare(password, storedHashedPassword);
        return result ? true : false;
    } catch (err) {
        console.log("Can't verify password");
        throw err;
    }
}

export default hashPassword;
