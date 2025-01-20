namespace hashes {
    interface ObjectKeyPath {
        path: string[];
        /**
         * On this path a circular reference was found to another object in the tree
         * 
         * In that case, our hash is hash of the original path
         */
        isObjectCircular?: boolean;
        hash: bigint;
    }
}