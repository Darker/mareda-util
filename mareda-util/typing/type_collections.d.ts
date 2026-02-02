namespace mtypes {
    type Merge<A, B> = {
        [K in keyof A | keyof B]: 
          K extends keyof A & keyof B
          ? A[K] | B[K]
          : K extends keyof B
          ? B[K]
          : K extends keyof A
          ? A[K]
          : never;
    };

    type Pick<T, K extends keyof T> = {
        [P in K]: T[P];
    }
}