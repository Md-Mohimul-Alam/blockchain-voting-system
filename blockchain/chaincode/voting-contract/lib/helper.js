'use strict';

async function candidateExists(ctx, candidateID) {
    const candidateAsBytes = await ctx.stub.getState(candidateID);
    return candidateAsBytes && candidateAsBytes.length > 0;
}

async function getStateAsObject(ctx, key) {
    const dataAsBytes = await ctx.stub.getState(key);
    if (!dataAsBytes || dataAsBytes.length === 0) {
        throw new Error(`No record found for ${key}`);
    }
    return JSON.parse(dataAsBytes.toString());
}

module.exports = { candidateExists, getStateAsObject };
