---
title: NT Ring0 Arbitrary Memory Access
description: Hunting arbitrary ring0 memory access vulnerabilities in the wild
author: Harry Kerr
fSlug: nt-ring0-arbitrary-memory-access
dop: 08/03/2024
---

# Hello
This blog posts' goal is to explore finding arbitrary memory vulnerabilities on NT based kernels (Windows).

## The attack

```cpp
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
print("hello")
```