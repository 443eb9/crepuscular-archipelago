---
title: 汇编学习笔记 Note.asm
desc: 汇编学习笔记，字面意思（10.18注：改掉WIP的时候忘记填时间了，所以并不是真实的日期（（
ty: Article
date: 2024-10-18T17:59:20.000+08:00
tags: 未分类
---

# 汇编学习笔记 Note.asm

此笔记仅适用于8086处理器，x86的...以后再补吧（逃

## Debug 命令

| 命令             | 全名       | 用途                |
| ---------------- | ---------- | ------------------- |
| `r`              | Register   | 读取寄存器          |
| `d [dst] [len]`  | Dump       | 读取内存            |
| `e <dst> [data]` | Enter      | 写入内存            |
| `u [dst]`        | Unassemble | 翻译内存为指令      |
| `t`              | Trace      | 运行上一条指令      |
| `a [dst]`        | Assemble   | 写入内存为指令      |
| `g <addr>`       |            | 执行至 `addr`       |
| `p`              | Process    | 执行完下一个 `loop` |

## 寄存器

| 简写 | 全名                | 中文名         | 特殊用途                                        |
| ---- | ------------------- | -------------- | ----------------------------------------------- |
| `AX` | Accumulator         | 累加寄存器     |                                                 |
| `BX` | Base                | 基址寄存器     | 作为偏移地址，`mov ax,[bx+2]`                   |
| `CX` | Count               | 计数寄存器     | 当前循环的剩余次数                              |
| `DX` | Data                | 数据寄存器     |                                                 |
| `BP` | Base Pointer        | 基址指针寄存器 |                                                 |
| `SI` | Source Index        | 源变址寄存器   | 作为偏移地址，`mov ax,[si+2]`                   |
| `DI` | Destination Index   | 目的变址寄存器 | 作为偏移地址，`mov ax,[di+2]`                   |
| `IP` | Instruction Pointer | 指令指针寄存器 | 当前代码的偏移地址， `CS:IP` 即为当前操作       |
| `CS` | Code Segment        | 代码段寄存器   | 当前代码的段地址， `CS:IP` 即为当前操作         |
| `DS` | Data Segment        | 数据段寄存器   | 当前段地址，`[x]` 即为 `DS:x` 地址              |
| `SS` | Stack Segment       | 堆栈段寄存器   | 当前栈顶的段地址， `SS:SP` 即为当前栈顶的元素   |
| `SP` | Stack Pointer       | 栈指针寄存器   | 当前栈顶的偏移地址， `SS:SP` 即为当前栈顶的元素 |
| `ES` | Extra Segment       | 附加段寄存器   |                                                 |

`X[L/H]` 表示 `X` 寄存器的 低/高八位 。

## 标志寄存器

| 简写 | 全名                 | 用途                                                          |
| ---- | -------------------- | ------------------------------------------------------------- |
| `ZF` | Zero Flag            | 上一次指令的结果是否为0                                       |
| `PF` | Parity Flag          | 上一次指令的结果bit位中是否有偶数个1                          |
| `SF` | Sign Flag            | 上一次指令的结果是否为正数                                    |
| `CF` | Carry Flag           | 上一次指令的结果是否需要进位                                  |
| `OF` | Overflow Flag        | 上一次指令的结果是否超出了CPU可表示的最大数                   |
| `AF` | Auxiliary Carry Flag | 上一次指令是否需要第3位向第4位进位                            |
| `IF` | Interrupt Flag       | 是否允许CPU响应中断                                           |
| `TF` | Trap Flag            | 是否进行单步调试                                              |
| `DF` | Directional Flag     | 用于字符串处理，决定在每次执行后将 `SI` `DI` 减小(1)或增大(0) |

进位和溢出的区别：进位是针对无符号运算，溢出针对有符号运算。

## 指令

机器可以直接执行的指令。

### 算数

| 指令                     | 用途                                                                       | 备注                                                 |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `mov <dst>,<src>`        | `dst = src`                                                                |                                                      |
| `add <dst>,<src>`        | `dst += src`                                                               |                                                      |
| `adc <dst>,<src>`        | `dst += src + CF`                                                          | 带进位的加法，将上一次运算的进位结果加到这次的结果上 |
| `sub <dst>,<src>`        | `dst -= src`                                                               |                                                      |
| `sbb <dst>,<src>`        | `dst -= src + CF`                                                          | 带借位的加法，将这次的结果减去上一次运算的借位结果   |
| `mul [dst]{AX/AL},<src>` | `dst *= src`                                                               | 16位乘法结果低八位默认在 `AX` 高八位默认在 `DX`      |
| `div <src>`              | `AX = DX:AX / src; DX = DX:AX % src` </br> `AL = AX / src; AH = AX % src;` | 前者为16位除数，后者为8位除数                        |
| `neg <x>`                | `x = -x` (Equals to `x ^= !0; x++` and `x ^= (!0 >> 1); x \|= (1 << 15)`)  |                                                      |
| `cmp <lhs>,<rhs>`        | `lhs - rhs`                                                                | 只进行计算，并改变且仅改变标志寄存器中的内容         |

除16位乘法外，溢出部分舍弃或存在 `CF` 内。

### 逻辑

| 指令              | 用途          | 备注 |
| ----------------- | ------------- | ---- |
| `and <dst>,<src>` | `dst &= src`  |      |
| `or <dst>,<src>`  | `dst \|= src` |      |

### 位

| 指令              | 用途                          | 备注                     |
| ----------------- | ----------------------------- | ------------------------ |
| `shl <src>,<val>` | `src <<= val`                 |                          |
| `shr <src>,<val>` | `src >>= val`                 |                          |
| `rol <src>,<val>` | `src = src.rotate_left(val)`  | `rotate_left()` in Rust  |
| `ror <src>,<val>` | `src = src.rotate_right(val)` | `rotate_right()` in Rust |
| `inc <src>`       | `src++`                       |                          |
| `dec <src>`       | `src--`                       |                          |

### 跳转

| 指令                  | 用途                                          | 备注                                          |
| --------------------- | --------------------------------------------- | --------------------------------------------- |
| `jmp <addr>`          | 跳转至 `addr`                                 | 本质上是在修改 `CS` 和 `IP` ，或者只修改 `IP` |
| `je <addr>`           | 若 `lhs == rhs` 则跳转至 `addr`               | `if ZF == 0 { jump }`                         |
| `jne <addr>`          | 若 `lhs != rhs` 则跳转至 `addr`               | `if ZF == 1 { jump }`                         |
| `jb <addr>`           | 若 `lhs < rhs` 则跳转至 `addr`                | `if CF == 0 { jump }`                         |
| `jnb <addr>`          | 若 `lhs >= rhs` 则跳转至 `addr`               | `if CF == 1 { jump }`                         |
| `ja <addr>`           | 若 `lhs > rhs` 则跳转至 `addr`                | `if CF == 0 && ZF == 0 { jump }`              |
| `jna <addr>`          | 若 `lhs >= rhs` 则跳转至 `addr`               | `if CF == 1 \|\| ZF == 1 { jump }`            |
| `loop <addr>`         | `CX -= 1` ，若 `CX != 0` 则跳转至 `addr`      | 注意，条件是 `!=` 而不是 `>`                  |
| `call <addr>`         | 跳转至 `addr` 直到 `ret` 返回                 | 本质上是在修改 `IP`                           |
| `call far ptr <addr>` | 跳转至 `addr` 直到 `retf` 返回                | 本质上是在修改 `CS` 和 `IP`                   |
| `ret`                 | 返回至 `call <addr>` 中， `addr` 的下一个指令 | 本质上是在修改 `IP`                           |
| `retf`                | 返回至 `call <addr>` 中， `addr` 的下一个指令 | 本质上是在修改 `CS` 和 `IP`                   |

CPU在执行 `call` 指令时，会先将 `IP` 压入栈内，然后在 `ret` 的时候弹栈，就可以获取到 `call` 指令的下一条指令（ `call far ptr` 同理，但是还需要 `CS` ）

### 特殊

| 指令           | 用途                                                                              | 备注                        |
| -------------- | --------------------------------------------------------------------------------- | --------------------------- |
| `xchg <a>,<b>` | `swap(a, b)`                                                                      | `swap()` in Rust `std::mem` |
| `nop`          | 空指令                                                                            |                             |
| `int <x>`      | 产生中断 `x`                                                                      |                             |
| `push <src>`   | 将 `SS:SP` 作为栈顶，依次推入 `XH` `XL` ，如果 `src` 是***整个***寄存器的话       | `SP` 同时会回退             |
| `pop <dst>`    | 将 `SS:SP` 作为栈顶，依次退出并存至 `XL` `XH` ，如果 `src` 是***整个***寄存器的话 | `SP` 同时会回退             |

## `.asm` 程序源代码

在 `MASM` 中，需要先编译 `masm <src.asm>` ，链接 `link <src.obj>` ，才可以运行 `src.exe`

### 伪指令

给汇编编译器看的指令，不能被直接执行。

### 循环

```assembly
assume cs:codesg       ; 将 CS 寄存器别名为 codesg，这里的别名是可以被赋值给寄存器的
codesg segment         ; 定义代码起点
    mov ax,2
    mov bx,3
    add ax,bx
    f:                 ; 定义函数
        sub ax,cx
        loop f         ; 跳转至函数入口，此处 f 取代函数入口的具体地址
    int 21H
codesg ends            ; 定义代码终点
end                    ; 定义程序终点
```

### 函数

```assembly
assume cs:codesg
codesg segment
    mov ax,2
    mov bx,3
    add ax,bx
    call f             ; 调用 f 函数
    int 21H
    f:                 ; 定义函数
        sub ax,cx
        ret            ; 返回函数
codesg ends            ; 定义代码终点
end                    ; 定义程序终点
```

### 数据使用

```assembly
assume cs:codesg,ds:data,ss:stack
data segment
    db 'hello'         ; 在数据段中使用数据，可以像这样使用ASCII存储字符
data ends

stack segment
    dw 10 dup(0)       ; 在栈段使用数据，需要先开一段内存，表示开出10个0
stack ends

codesg segment
    dw 0abcH,8086      ; 在代码段中使用数据，16进制不可以字母打头，可以加0来规避
start:                 ; 必须标记代码起点
    mov ax,2
    int 21H
codesg ends
end start              ; 以及终点
```

### `offset` 操作符

```assembly
assume cs:codesg
codesg segment
    mov ax,2
    mov bx,offset s    ; 将s的偏移地址赋值给BX
    mov cs:[di],dx     ; 将DX处的指令赋给CS:DI，注意，cs:[di]不是真正的寻址方式
    int 21H
    s:
        mov ax,1
        loop s
codesg ends
end
```

### `jmp` 的更多用法

这里的用法仅限于源文件内

```assembly
assume cs:codesg
codesg segment
    mov ax,2
    jmp short s        ; 近转移
    int 21H
    s:
        mov ax,1
        loop s
codesg ends
end
```

`jmp short/jmp near ptr` 可转移至1字节内距离的指令 `-128~127` ，因为其机器码记录的是距离 ，`jmp far/jmp far ptr` 没有限制，因为其机器码记录的是具体地址。

```assembly
assume cs:codesg
codesg segment
    mov ax,0123H
    mov ds:[0],ax
    jmp word ptr ds:[0]
codesg ends
end
```

`word ptr <addr>` 表示从 `addr` 开始的一个字作为偏移地址。

`dword ptr <addr>` 表示从 `addr` 开始的一个双字作为具体地址。

### 数组

```assembly
assume cs:codesg,ds:data
data segment
    arr db 1,2,3,4
data ends

codesg segment
    arr dw 1,2,3,4
    start:
        mov ax,arr[0]   ; 数组的访问，不写索引就是第0个元素
        mov ax,data     ; 这三行是获取在其他段内的数据
        mov ds,ax
        mov al,arr[2]
        mov arr[2],ds   ; 反过来修改也可以
        int 21H
codesg ends
end start
```

本质上此处的 `0` 不是下标，而是在数组原地址进行偏移的字节量。

## 地址

物理地址 `Physical` = 段地址 `Segment` * 16 + 偏移地址 `Offset`

| 寻址方式    | 段地址 | 偏移地址  |
| ----------- | ------ | --------- |
| `[i]`       | `DS`   | `i`       |
| `[bx]`      | `DS`   | `BX`      |
| `[si]`      | `DS`   | `si`      |
| `[di]`      | `DS`   | `di`      |
| `[bp]`      | `SS`   | `BP`      |
| `[bx+i]`    | `DS`   | `bx+i`    |
| `[si+i]`    | `DS`   | `si+i`    |
| `[di+i]`    | `DS`   | `di+i`    |
| `[bp+i]`    | `SS`   | `bp+i`    |
| `[bx+si]`   | `DS`   | `bx+si`   |
| `[bx+di]`   | `DS`   | `bx+di`   |
| `[bp+si]`   | `SS`   | `bp+si`   |
| `[bp+di]`   | `SS`   | `bp+di`   |
| `[bx+si+i]` | `DS`   | `bx+si+i` |
| `[bx+di+i]` | `DS`   | `bx+di+i` |
| `[bp+si+i]` | `SS`   | `bp+si+i` |
| `[bp+di+i]` | `SS`   | `bp+di+i` |

还有一些特殊写法

| 寻址方式      | 句法                                                     |
| ------------- | -------------------------------------------------------- |
| `[reg+i]`     | 结构体 `[reg].i`; 数组 `i[reg]`; 二维数组 `[reg][reg]`   |
| `[reg+reg]`   | 二维数组 `[reg][reg]`                                    |
| `[reg+reg+i]` | 表格/结构中的数组 `[reg].i[reg]`; 二维数组 `i[reg][reg]` |

## 参考资料

- [《汇编语言》速成指南(全程敲代码)](https://www.bilibili.com/video/BV1eG4y1S7R5)
- [Flag register of 8086 microprocessor](https://www.geeksforgeeks.org/flag-register-8086-microprocessor/)
