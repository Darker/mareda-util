namespace time {
    type ms = number & { readonly __milliseconds: unique symbol };
    type s = number & { readonly __seconds: unique symbol };
}