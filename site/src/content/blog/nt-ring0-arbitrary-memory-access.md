---
title: NT Ring0 Arbitrary Memory Access
description: Hunting arbitrary ring0 memory access vulnerabilities in the wild
author: Harry Kerr
fSlug: nt-ring0-arbitrary-memory-access
dop: 03/08/2024
---

# Hello & Preface

This post has the goal to explore finding arbitrary memory vulnerabilities on NT based kernels (Windows), or in simple terms, finding ways to get into the kernel.

## The target

In this blog post we're just going to cover how to attack kernel drivers via I/O control codes (IOCTL) calls.
IOCTLs are the REST-API of the driver world, we make a request to the driver via these IOCTL's
we get back a response from the driver, or the driver performs some task based on the input we've provided it.

## What is an IOCTL

An IOCTL allows for usermode applications (usually running as Administrator in Windows terms) to communicate with drivers, via some shared protocol defined at the software level that both the application and driver share.

An IOCTL code is structured in the following way [credit to microsoft for the picture](https://learn.microsoft.com/en-us/windows-hardware/drivers/kernel/defining-i-o-control-codes):
![A diagram specifying the structure of an IOCTL code, the important part is the 12th to 2nd bit containing the function code](../../../public/blog/nt-ring0-arbitrary-memory-access/ioctl-1.png)

The `transfer type` bits are important because it specifies how the IOCTL endpoint takes the payload (`METHOD_BUFFERED`, `METHOD_IN_DIRECT` and `METHOD_OUT_DIRECT`).
All of which we'll cover later on when we get to the decompilation section of this post.

## How we're attacking IOCTLs

When researching this topic prior, I stumbled across [this article](https://blog.back.engineering/01/11/2020/) by "back.engineering",
which goes into depth about how you can attack drivers using dangerous Windows API functions incorrectly.

### [MmMapIoSpace](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/wdm/nf-wdm-mmmapiospace)

```cpp
PVOID MmMapIoSpace(
  PHYSICAL_ADDRESS    PhysicalAddress,
  SIZE_T              NumberOfBytes,
  MEMORY_CACHING_TYPE CacheType
);
```

This function looks abit daunting, let's break it down.
`MmMapIoSpace` takes a physical address an amount of bytes and maps it to a virtual address we can access and write to from our application.

#### What is a physical address?
Simply put these physical addresses represent and address on the physical RAM/Memory module, to go into how these work would take far far too long. 
When you write code, and you allocate memory (via malloc or the stack or something), normally, you'll plop your object/buffer in this space 0x000'00000000 - 0x7FFF'FFFFFFFF. 
This is just to your application, you have *potentially* [128 Terabytes of uninterupted](https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/virtual-address-spaces), contiguous memory.
However we can't do this for every application running on a computer, so we have to do some magic as the processor and place a bit of your allocated memory in other parts of the RAM/Memory, as there might not always be *for example* 10,000 KB free contiguously. So we just keep a note (or page) somewhere of what parts of Physical Memory you have allocated to which Virtual Address.
This process is called Paging, and something we'll go into in another seperate blog post. 
But for right now you sort of only need to know there are two types of addresses, Virtual and Physical.


\
Let's roleplay a silly/lazy kernel developer writing some vulnerable code, perhaps we're writing a fan driver
and we have some hardware (the fan) reading information from a specific physical address in memory from our usermode application.
Of course, we're not allowed to write to physical memory addresses from user-mode, so we have to get our driver to that bit.
But again, we're lazy, and we have a bunch of different hardware reading from different addresses.
It's easier for us to update our application than it is to update our driver, so we'll just **trust** the value from the application.
```c
/**
for the sake of brevity, assume all of these parameters are user specified
**/
int ioctl_handler(
  PHYSICAL_ADDRESS  physicalAddress,
  void*             userSpaceBuffer,
  SIZE_T            userSpaceBufferSize
)
{
  // ...
  void* thePhysicalBuffer = MmMapIoSpace(physicalAddress, userSpaceBufferSize, MmNonCached)
  memcpy(thePhysicalBuffer, userSpaceBuffer, userSpaceBufferSize); // copy memory into mapped buffer
}
```
Hmm, Well our boss is now happy, we've pushed it live, it works and we've future proofed it!

Now let's come back to reality and work out what's gone wrong here. We've just allowed any application with Administrator to write memory **ANYWHERE** in the computer, kernel etc. 
Why? because we're trusting the IOCTL call, we've not checked any of the parameters going into this function.


### [ZwMapViewOfSection](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/wdm/nf-wdm-zwmapviewofsection)

### [MmCopyMemory](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntddk/nf-ntddk-mmcopymemory)

So our plan is to:

1. Scan a driver, checking for the vulnerable methods listed above.
2. Open up the driver in Ghidra and determine how it's used and check if we can control the input to it
3. If we can, write up a Proof of Concept
4. Profit?

## The Tools:

To explore potentially vulnerable drivers, we must acquire some basic tools. The tools I've listed here are just
ones I personally use.

### Ghidra:

- Author: NSA (yes that NSA)
- Source: https://github.com/NationalSecurityAgency/ghidra
- License: Apache 2.0
- Note: Used to decompile the drivers we're investigating.

### Suspector:

- Author: Harry Kerr (that's me!)
- Source: https://github.com/NoSharp/suspector
- License: MIT
- Note: Used to identify potentially vulnerable drivers from a large list of drivers.

## References & Credits

- my lovely girlfriend [emily](https://emilymedhurst.gay/) for proof-reading this
- https://learn.microsoft.com/en-us/windows-hardware/drivers/kernel/defining-i-o-control-codes
