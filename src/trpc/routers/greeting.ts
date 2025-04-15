import { baseProcedure, createTRPCRouter } from "..";

export const greetingRouter = createTRPCRouter({
    hello: baseProcedure.query(({ ctx }) => {
        if (ctx.auth.userId) {
            return {
                greeting: `hello ${ctx.auth.userId}`,
            };
        } else {
            return {
                greeting: "hello world",
            };
        }
    }),
});
