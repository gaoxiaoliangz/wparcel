// https://stackoverflow.com/questions/41285211/overriding-interface-property-type-defined-in-typescript-d-ts-file
type Modify<T, R> = Pick<T, Exclude<keyof T, keyof R>> & R
