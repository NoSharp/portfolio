---
title: Physical Memory and Virtual Memory translation
description: Physical memory, memory structure and Virtual memory address translation.
author: Harry Kerr
dop: 03/09/2024
wip: false
---

The goal of this blog post is to FULLY understand what physical and virtual memory is and
how we can find a physical address from a virtual address and vice-versa on Windows.
This blog post is lengthly and attempts to explore how the CPU and OS actually translate Virtual Memory.
I wrote this whilst learning how this all works, so I apologise in advance if there's any errors.
At the end of the blog post I will write a proof of concept to demonstrate the translation between
Virtual and Physical memory without any Windows API calls.

# What is Physical Memory

Physical Memory is the actual hardware (RAM).
So when we're talking about a physical memory address we're talking about an address on the hardware.
We need this address space for inter-hardware communication, or interacting with hardware from software.
To give an idea, let's say we have a CPU Fan, and we want to control the speed of the fan through software,
to do this we could as the hardware read a "speed" from physical address `0x5000` which the software writes to.
This means that the fan doesn't need to be aware of the intracies of every system, it just knows "Read address at `0x5000`"
and makes the lives of Hardware Developers much easier, this process is known as Direct Memory Access.

## Direct Memory Access (DMA)
DMA is how other devices communicate with the computer to access memory. 
The DMA protocols only have knowledge of the physical address space, and has no idea how memory is mapped by the CPU & MMU (Memory Management Unit, we'll cover this later).
There's a few different methods and specifications of DMA which most definitely should be their own post, so I won't go into to much detail here.
So for now just know it exists and magically helps hardware communicate with the CPU.

# What is Virtual Memory
Virtual Memory is the address spsace the application "sees", this address space is continguous between `0x000'00000000`-`0x7FFF'FFFFFFFF` [5] on x86-64 and AArch64 systems.
The address space on 64 bit machines is normally 48 bits, the consensus appears to be that it's unneeded to have 64 bits of space as 48 bits has 256TB of potential memory space.
Virtual Memory encapsulates an application, preventing it from accessing other application's memory *without calling certain OS specific APIs*. 
Additionally this encapsulation means that when the application fails, the application itself fails and *shouldn't, in practice this isn't the case* break anything else.
#### !!! TODO Add Image

## Windows Kernel Virtual Memory Allocation
In the **WINDOWS** Kernel, there is no seperate virtual address space for each driver [5].
So all drivers share the same address space. This is important because we'll likely be in the kernel when writing a POC later on.

# Translating between address spaces.

## Paging

## AMD64/x86-64 Long-Mode Page Translation


### Brief information on Model Specific Registers
The MSRs are a set of registers used to track things like CPU features[10].
To read/write to these registers we need CPL (Current Privilege Level) 0, which essentially means we need access to be "kernel level" and for the code we're running to be in kernel space.
We can read these registers using the instruction `rdmsr`.
`rdmsr` takes in one parameter in `ECX`, the MSR register number, then returns the MSR data in `EAX, EBX, ECX and EDX`.

### Determining if Long-Mode Page Translation is enabled
In-order to detect if the processor is running with Long-Mode Page translation running, we need to do a few things,
we need to check if the processor is running in Long-Mode which enables 64-bit addressing and the 64-bit functionality of the CPU,
if PSE (Physical Address Extensions) and PSE (Page-Size extensions) are enabled.
To check if the processor is running in Long Mode we need to read something called an MSR (Model Specfic Register), PAE and PSE. 
For long mode the status of this feature is stored in the MSR EFER (Extended features enable register).
PAE allow 52-bit Physical Addresses, 4 Peta-Bytes of physical memory[6].
PSE set the page size to 4 Mega Bytes[6] this will be explained later on.

Let's write some code to check if this is all enabled.
There is an assembly instruction called "cpuid", this instruction is used to retrieve information from the processor, 
things like what technologies are enabled, the type of processor etc.
To check if PAE and PSE is enabled, we want to use leaf `1`. A leaf is a way for us to tell the processor what information we want, this is passed on the EAX register.
The PAE bit (showing if it's enabled) is returned in the EDX Register, on the 6th bit and PSE on the 3rd bit [9]. 

We need to also check if the EFER MSR is in long-mode by using `rdmsr` from earlier, with the model register `0xC0000080` (EFER).
On the EFER register we want to check bit `10` or LMA (Long Mode Active), if it's `1` then it's active.

We can do this in the following code:
```c
    int registers[4] = {
    0x0, // EAX
    0x0, // EBX
    0x0, // ECX
    0x0 // EDX
  };
  __cpuid(registers, 1);
  printf("PAE bit: %d\n", registers[3] & (1 << 6));
  printf("PSE bit: %d\n", registers[3] & (1 << 3));

  // REQUIRES CPL 0
  unsigned long long efer = __readmsr(0xC0000080);
  printf("LMA active: %d\n", (int)(efer & (1 << 10)));
```
We expect, if PAE is enabled, for this to return something non-zero, same for PSE and LMA.
And it does:
```
PAE bit: 64
PSE bit: 8
LMA active: 1024
```

Great so Long-Mode Page translation is enabled on this computer let's get started in working out how it works.

## Virtual to Physical in the Kernel
Well, luckily for us, we have the [MmGetPhysicalAddress](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntddk/nf-ntddk-mmgetphysicaladdress) function provided by Microsoft.
```cpp 
PHYSICAL_ADDRESS MmGetPhysicalAddress(
  [in] PVOID BaseAddress
);
```
This function simply takes in a Virtual Address (the `BaseAddress` parameter) and returns the Physical Address found.
Of course, this blog post would be useless if I just told you what you probably already know.
So lets dig a bit further and work out what it's doing.
Cracking open ghidra and doing a little clean up we see this:

```cpp title="MmGetPhysicalAddress.cpp"
ulonglong MmGetPhysicalAddress(PVOID BaseAddress)
{
  int status;
  undefined4 auStackX_10 [2];
  ulonglong auStackX_18 [2];
  auStackX_10[0] = 0;
  auStackX_18[0] = 0;
  status = FUN_140249750(BaseAddress,auStackX_18,auStackX_10);
  return -(ulonglong)(status != 0) & auStackX_18[0];
}
```

It appears the actual meat and potatoes of this function is in `VirtualToPhysicalAddress`, so lets open that up.

```cpp title="FUN_140249750.cpp"
undefined8 FUN_140249750(PVOID param_1, ulonglong *param_2,undefined4 *param_3)

{
  ulonglong *puVar1;
  longlong lVar2;
  int iVar3;
  ulonglong uVar4;
  ulonglong uVar5;
  ulonglong *puVar6;
  longlong lVar7;
  undefined uVar8;
  ulonglong *puVar9;
  undefined unaff_R14B;
  undefined unaff_R15B;
  undefined8 local_res18;
  undefined4 in_stack_00000028;
  ulonglong *puStack_40;
  unkbyte9 Var10;
  unkbyte9 Var11;
  
  *param_3 = 0;
  Var10 = SUB169(ZEXT816(0),0);
  Var11 = SUB169(ZEXT816(0),0);
  
  FUN_14024b310((ulonglong)param_1,(ulonglong *)&stack0xffffffffffffffc8);
  // Based on it's usage, we can assume it's validating this 
  iVar3 = Validator1((PHYSICAL_ADDRESS)param_1);
  if (iVar3 == 0) {
    lVar7 = 4;
    do {
      puVar9 = (&puStack_40)[lVar7];
      lVar7 = lVar7 + -1;
      puVar1 = (ulonglong *)*puVar9;
      puVar6 = puVar1;
      if (((((ulonglong *)0xfffff6fb7dbecfff < puVar9) && (puVar9 < (ulonglong *)0xfffff6fb7dbed7f9)
           ) && (((uint)DAT_140d1da08 & 0x600000) != 0)) &&
         (*(char *)(*(longlong *)((longlong)SystemReserved1[15] + 0xb8) + 0x390) != '\x01')) {
        if (((ulonglong)puVar1 & 1) == 0) {
          return 0;
        }
        if (((((ulonglong)puVar1 & 0x20) == 0) || (((ulonglong)puVar1 & 0x42) == 0)) &&
           ((lVar2 = *(longlong *)(*(longlong *)((longlong)SystemReserved1[15] + 0xb8) + 0x788),
            lVar2 != 0 &&
            (puVar6 = (ulonglong *)((ulonglong)puVar1 | 0x20),
            puVar9 = (ulonglong *)((ulonglong)puVar1 | 0x20),
            (*(ulonglong *)(lVar2 + (ulonglong)((uint)((ulonglong)puVar9 >> 3) & 0x1ff) * 8) & 0x20)
            == 0)))) {
          puVar6 = puVar1;
          puVar9 = puVar1;
        }
      }
      uVar8 = SUB81(puVar9,0);
      if (((ulonglong)puVar6 & 1) == 0) {
        return 0;
      }
    } while (lVar7 != 1);
    uVar4 = FUN_14029f5b0((ulonglong *)Var10);
    local_res18 = uVar4;
    iVar3 = FUN_140258890(param_1);
    puVar9 = (ulonglong *)Var10;
    if (iVar3 == 0xc) {
      FUN_14020b6a0(param_1,uVar4,0,uVar8,(char)Var10,(char)((unkuint9)Var10 >> 0x40),(char)Var11,
                    (char)((unkuint9)Var11 >> 0x40),unaff_R15B,unaff_R14B,in_stack_00000028);
    }
    if ((uVar4 & 1) == 0) {
      return 0;
    }
    if (iVar3 == 5) {
      FUN_14063f388(puVar9);
      uVar4 = FUN_14029f5b0(puVar9);
      local_res18 = uVar4;
    }
    uVar5 = FUN_14029f5b0(&local_res18);
    uVar5 = uVar5 >> 0xc & 0xffffffffff;
  }
  else {
    uVar5 = FUN_1403890b0(param_1);
    uVar4 = FUN_14029f5b0(*(ulonglong **)(&stack0xffffffffffffffc8 + (longlong)iVar3 * 8));
  }
  if ((uVar4 & 0x800) != 0) {
    *param_3 = 1;
  }
  local_res18 = CONCAT44((int)((uVar5 << 0xc) >> 0x20),((uint)param_1 & 0xfff) + (int)(uVar5 << 0xc)
                        );
  *param_2 = local_res18;
  return 1;
}
```

# References & Credits
Some of the references aren't cited in the blog post, however they helped me understand the topic.
This blog post is standing on the shoulders of giants linked below.

1) [OS-Dev](https://wiki.osdev.org/Expanded_Main_Page)
2) [DMA OS-Dev](https://wiki.osdev.org/ISA_DMA)
3) [MMU OS-Dev](https://wiki.osdev.org/MMU)
4) [64 Bit Computing Wikipedia](https://en.wikipedia.org/wiki/64-bit_computing)
5) [Virtual Address Space Microsoft](https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/virtual-address-spaces)
6) [AMD64 Docs AMD](https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/programmer-references/40332.pdf)
7) [Page Table Wikipedia](https://en.wikipedia.org/wiki/Page_table)
8) [Paging OSDev](https://wiki.osdev.org/Paging)
9) [CPUID Wikipedia](https://en.wikipedia.org/wiki/CPUID)
10) [MSR Wikipedia](https://en.wikipedia.org/wiki/Model-specific_register)