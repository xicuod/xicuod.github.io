---
weight: 550
slug: domain-driven-design
title: 领域驱动设计 DDD
---

> 写于2026年1月初。坐标：软件开发-实践-领域驱动设计。

DDD（domain-driven design，领域驱动设计）是一个很好的应用于微服务架构的方法论。DDD要求，在项目的全生命周期内，所有岗位的人员都基于对业务的相同的理解来开展工作。所有人员都站在用户的角度、业务的角度去思考问题，而不是站在技术的角度去思考问题。DDD诞生于2004年，兴起于2014年（微服务元年）。

## 怎样学习DDD？

DDD晦涩难懂，难以落地。因为DDD是方法论，不是行动指南。“盐少许、油少许”，每个人对DDD的理解和落地都不同，而且没有绝对的对错。如果只学习DDD概念而没有了解如何应用的话，会感觉没有落地；而如果过早关注落地的话，会导致理解片面。

DDD的正确学习姿势：从理论到实践，从实践再到理论。不要一下子学DDD的整体。不同岗位、不同阶段的人先从自己的角度学习DDD的一部分。

软件开发的实践方案按出现顺序来讲，分别为单体结构项目、微服务结构项目和领域驱动设计。

## 单体结构项目的缺陷

单体结构项目：同一个进程处理订单模块、支付模块和物流模块，所有功能都是在同一个进程运行。

- 优点：方便部署。
- 缺点：耦合；一崩全崩；无法局部扩容；技术栈统一，软件包版本锁定；升级周期长。

## 微服务结构项目的优势

微服务结构项目：订单模块、物流模块和支付模块都是单独的进程，且它们分别部署在单独的服务器上，通过API网关转发客户端的请求到相应的服务器。

- 优点：耦合性低，便于开发和维护；每个模块可以用各自的技术栈；可以单独扩容；互相隔离，影响小；部署周期短。
- 缺点：对运维能力要求高；跨进程，运行效率降低；技术要求高，需要处理事务最终一致性等问题。

微服务项目的设计原则：

- 尽可能减少微服务之间的互相调用，这会降低性能，增加耦合度；尽量做到扁平化。
- 微服务架构应该是进化而来的；微服务应该是**拆分进化**的，先有少量微服务，后续扩大了再拆分。领域驱动设计是指导微服务拆分的重要原则。

微服务第一定律：避免使用微服务，除非有充分的理由。——杨中科 B站

> 分布式第一定律：尽量不要使用分布式，除非有充分理由。——分布式概念的提出者

## 通用语言和界限上下文

通用语言：一个拥有确切含义的、没有二义性的语言。

- 反例：“我想要商品可以被删除”→“我想要把删除的还原回来”→“Windows回收站都能”→此“删除”非彼“删除”。
- 反例：此“用户”非彼“用户”。

界限上下文：通用语言离不开特定的语义环境，只有确定了通用语言所在的边界，才能没有歧义的描述一个业务。

- 后台管理系统的“用户”指的是卖家，商城购物车的“用户”指的是买家。

## 领域

领域（Domain）：一个组织做的事情（手机领域）。子领域（手机设计子领域、手机制造子领域、软件设计子领域、销售子领域、市场子领域、售后子领域、后勤子领域、人事子领域）。

领域的划分（以手机公司为例）：

- 核心域：解决项目的核心问题，和组织业务紧密相关。（手机设计、手机制造）
- 支撑域：解决项目的非核心问题，则具有组织特性，但不具有通用性。（软件设计、销售、市场、售后）
- 通用域：解决通用问题，没有组织特性。（后勤、人事，可以外包）

领域的不同分类决定了公司的研发重点。（操作系统是软件公司的通用域，同时也是操作系统公司的核心域）

软件公司领域划分：

- 核心域：业务系统开发
- 支撑域：运维
- 通用域：数据库、操作系统、数据中心（IDC）、保安

## 领域模型

对领域内的对象建模，从而抽象出来领域模型（Domain Model）。以银行为例：柜员、客户、ATM机、排队机等。我们的项目应该开始于创建领域模型，而不是考虑如何设计数据库和编写代码。使用领域模型，我们可以一直用业务语言去描述和构建系统，而不是使用技术人员的语言（[事务脚本](#事务脚本伪代码)，它是DDD不提倡的）。

## 领域知识

如果不刻意设计就得在注释或文档中注明的业务信息，就叫“领域知识”。

- 值对象中的领域知识：商品的重量数值隐含了它的单位，金额数值隐含了它的币种，这些数值背后的隐含信息，就是重量和金额的“领域知识”。
- 实体中的领域知识：用户的用户名不能为空，密码长度不能少于 6 位，这些是用户的“领域知识”。

## 聚合

哪些实体可以聚合（Aggregate）起来？生命周期和一致性边界相同的、具有整体和局部关系的实体。

聚合的目的：高内聚，低耦合。有关系的实体紧密协作，而关系很弱的实体应该相互隔离。划分聚合还有助于以后把逐渐变“胖”的微服务拆分为若干个小的微服务。

> 发电机里的每个元件都在参与发电工作，它们是高内聚的；如果往发电机里面放一个鸡蛋，这个鸡蛋对发电没有任何作用，甚至鸡蛋破了还会起到反作用，鸡蛋和其他元件就是低内聚的。

> 发电机提供电流电压给灯泡，它们的耦合关系只是电流电压，除此之外再无其他，因此它们是低耦合的。其中，发电机可以换成其他能提供电流电压的设备，如电池，只要这个电流电压符合灯泡，灯泡也能换成其他接收电流电压的设备，如咖啡机。

### 聚合根

把关系紧密的实体放到一个聚合中，每个聚合中有一个实体作为聚合根（Aggregate Root），所有对于聚合内对象都通过聚合根访问，外部对象只能持有对聚合根的引用，不能持有其他的实体的引用。

> 发电机的给电接口就是发电机的聚合根，灯泡的取电底座就是灯泡的聚合根。

聚合根不仅仅是实体，还是所在聚合的管理者。

聚合体现的是现实世界中整体和部分的关系，比如订单与订单明细。整体封装了对部分的操作，部分与整体有相同的生命周期。部分不会单独与外部系统单独交互，与外部系统的交互都由整体来负责。

> 我要删除一个商品，我应该跟订单说，让订单处理那个商品，而不是跟订单明细说。因为订单除了在订单明细中删除那个商品，可能还需要维护自己的其他子模块，比如考虑满100减20的优惠，算一下删除后的总金额，或是检查一下该商品是不是必须买2个或以上，删除了只剩1个，于是给你报错等。如果我能单独和订单明细说，订单明细删除那个商品之后，就没下文了，订单的其他模块根本不知道发生了什么，也就没办法统一口径，大伙的说法对不上，于是订单只好原地爆炸。

> 订单明细和其他订单子模块对我应该是透明的，也就是说我不需要知道这些订单子模块是怎么运转的，我只需要知道订单这个整体能做什么就行了。

### 聚合的划分很难

系统中很多实体都存在着不同程度的关系，这些关系到底是设计为聚合之间的关系，还是聚合之内的关系，是很难的。

聚合的判断标准：实体是否是整体和部分的关系，是否存在着**相同的生命周期和一致性边界**。

- 订单与订单明细？是聚合关系，后者聚合于前者。
- 用户与订单？不是聚合关系。
  - 它们不是生死与共的，用户可以把订单交给其他人或系统处理，用户消失了，订单还存在，反之亦然；
  - 它们不是事务一致的，用户自身有地方变了，不会导致订单自身改变，反之亦然。

### 聚合的划分没有标准答案

聚合的划分应该具体问题具体分析，不同的业务流程也就决定了不同的划分方式。

新闻和新闻的评论？有些网站直接开一个单独的页面显示所有热门评论，这就需要新闻和新闻评论是两个单独的聚合。归根究底，是因为：

- 新闻和新闻评论的生命周期不一样：从业务逻辑上说，先有新闻，后有评论，且新闻一旦发布，内容不再变化，不做更改或仅作少量更改，而评论可以一直增长；
- 一致性边界也不一样：修改新闻内容时，不会同时修改评论内容，反之亦然。

### 聚合尽量划分的小一点

> 聚合宁愿设计的小一点，也不要设计的太大。

尽量把聚合设计的小一点，一个聚合只包含一个聚合根实体和互相密不可分的实体，实体中只包含最少个数的属性。经常一个聚合里面只有一个实体。小聚合有助于微服务的拆分。把新闻和新闻评论设计成两个聚合，可以天然地把它们拆分成两个微服务。

### 用例在DDD中的典型处理流程

1. 第一步，准备业务操作所需要的数据。
2. 第二步，执行由一个或者多个领域模型做出的业务操作，这些操作会修改实体的状态，或者生成一些操作结果。
3. 第三步，把对实体的变更或者操作结果应用于外部系统。

先获取对象等资源，把它们加到界限上下文中，再根据业务操作这些资源，最后应用于外部系统（如将结果保存到数据库）。

案例：增加某人的年龄：先获取人的对象 p1，把它加到界限上下文 ctx 中，再给它的 Age 加 1，最后保存到数据库。

### 领域服务和应用服务

> 聚合内的实体类中没有业务逻辑代码，只有对象的创建、对象的初始化、对象的状态管理等与单个个体相关的非业务逻辑代码。

对于聚合内的业务逻辑，我们编写领域服务（Domain Service）。而对于跨聚合协作以及聚合与外部系统协作的逻辑，我们编写应用服务（Application Service）。应用服务协调多个领域服务、外部系统来完成一个用例。

案例：订单系统微服务通过库存系统微服务检查用户购买的商品是否有货，如果没有，立即通知采购系统微服务采购商品。

领域服务与应用服务的职责划分：

- 领域服务是领域内的服务，与外部系统不会发生直接交互，领域服务不会涉及数据库操作。
- 领域内的业务逻辑放入领域服务，而与外部系统的交互由应用服务来负责。
- 领域服务不是必须的，在一些简单的业务处理中（比如简单的增删改查）是没有领域操作（也就是业务逻辑）的，这种情况下应用服务可以完成所有操作，不需要引入领域服务。这样可以避免过度设计。

领域服务和应用服务对事务一致性的要求：聚合内的数据操作是关系非常紧密的，对此我们要保证事务的强一致性；而聚合间的协作则是关系不紧密的，因此我们只要保证事务的最终一致性即可。

### EF Core 实现聚合与聚合根

区分根实体和一般实体：定义一个不含任何成员的标志接口 `IAggregateRoot`，让所有的聚合根实体类继承该接口。

1. 在 DbContext 中只配置聚合根的 DbSet 属性。
2. 在聚合根实体中定义操作聚合内所有实体的方法。
3. 外界只跟聚合根打交道就能完成业务。

即使一个实体类没有声明 DbSet 属性，只要 EF Core 遇到实体对象，就会像对待一般的实体对象那样处理。因此，我们只需要在 DbContext 配置中为聚合根实体声明 DbSet 属性，对非聚合根实体、值对象都通过聚合根实体操作即可。

比如订单和订单明细，它们共同组成一个聚合，其中订单是聚合根，订单明细聚合于订单。配置上下文时，只需要为订单配置 DbSet 属性即可。外界在使用时，只需要调用订单中的 AddDetail() 等方法就能操作订单明细。

聚合和 `DbContext` 的关系：如果一个微服务有多个聚合，那么应该为每个聚合都设计一个 DbContext，还是把所有聚合都放到一个 DbContext 里呢？一般采用后者。因为同一微服务中的聚合之间的关系仍然比它们与其他微服务中的聚合之间的关系更紧密，而且同一微服务中往往还有跨聚合的组合操作。把同一微服务的所有聚合都放到一个 DbContext 中，联合查询时性能更好，也更容易实现强一致性的事务。

跨聚合的实体引用，只能引用根实体的ID，不能引用一般实体，不能引用根实体的对象。这也是为了之后能够方便地拆分微服务。

### 应用服务实现跨表查询

所有跨聚合的数据查询都应该是通过领域服务的协作来完成的，而不是直接对数据库表做 JOIN 连接查询。虽然这样会有性能损失，但这是软件架构设计上的权衡之举。如果不能接受跨微服务查询性能的低下，可以设计冗余字段，可缓解性能损失。然而，对于统计、汇总等报表类的比较独立的业务，则不需要遵循聚合的约束，可通过执行原生 SQL 等方式跨表查询。

## 仓储和工作单元

- 仓储（Repository）：仓储负责按照要求从数据库中读取数据，以及把领域服务修改的数据保存回数据库。
- 工作单元（Unit Of Work）：聚合内的若干相关联的操作组成一个“工作单元”，这些工作单元要么全部成功，要么全部失败。

### EF Core 实现仓储和工作单元

EF Core 里面对于仓储的实现是 `DbContext` 类，对于工作单元的实现是 `DbContext` 的 `SaveChanges()` 方法。EF Core 的 DbContext 会跟踪对象的改变，SaveChanges() 会把所有的改变都一次性提交到数据库，是一个事务，因此 DbContext 天然是工作单元的实现。因此，虽然有观点认为应该把 EF Core 封装一层实现仓储和工作单元，但是 EF Core 本身就是这两者很好的实现，不需要再封装，多此一举。

## 实体

- 标识符：用来唯一定位一个对象，在数据库中我们一般用表的主键来实现标识符。主键和标识符的思考角度不同。
- 实体（Entity）：拥有唯一的标识符，标识符的值不会改变，而对象的其他状态则会经历各种变化。标识符用来跟踪对象状态变化，一个实体的对象无论怎样变化，我们都能通过标识符定位这个对象。实体一般基于但不等同于 Java 的 JPA 或 MyBatis 中的 POJO 类或 C# 的 EF Core 中的 POCO 类，它们还要加上领域知识和行为的封装，才能称为一个 DDD 实体类，否则它们就只是 ORM 实体类。

简单与复杂实践中 DDD 实体的差异：

- 有些简单项目或原型开发中，会直接让 ORM 实体兼任 DDD 实体，这种做法称为“贫瘠领域的重合模型”，勉强可行但容易导致领域层逻辑泄漏到基础设施层。
- 严格 DDD 实践通常建议分离领域实体与持久化实体：领域层使用纯 DDD 实体（无任何 ORM 注解），基础设施层通过映射（如 Hutool copyProperties()、MyBatis ResultMap 或 .NET AutoMapper）完成转换。

### 强类型标识符

而如果每种实体都有一个专门的标识符类，这就是“强类型标识符”。比如 `User` 类有 `UserId` 类，后者包含一个 `long` 类型的 `Value` 属性作为标识符的值，这样就有方法 `FindById(UserId id)`，一看就知道查的是 `User`，此时如果你传了 `OrderId`，那么就连编译器也会抱怨。

为什么要用强类型标识符？比如说一个方法 `FindById(long id)`，你不看文档或注释怎么知道它查的是什么实体呢？就算你把参数名从 `id` 换成 `userId`，`long` 类型也是硬伤，每种实体的标识符都是同一种类型，即使你搞错了要查的实体，编译器也不会抱怨。

但是要实现强类型标识符非常麻烦，这不仅是写个`Value`属性那么简单，还需要重写`Equals()`和`GetHashCode()`方法，重写那些比较运算符，甚至需要写值转换器`ValueConverter`或自动列的值生成器`ValueGenerator`……想要实现一个完整的强类型标识符就需要小 100 行代码。为此，杨中科开发了一个项目`LessCode.EFCore.StronglyTypedId`并开源，通过几行配置和 `[HasStronglyTypedId]` 注解即可轻松实现强类型标识符，具体用法参考[yangzhongke/LessCode. EFCore. StronglyTypedId: Automatically generate Types for Strongly Typed Id in Entity Framework Core](https://github.com/yangzhongke/LessCode.EFCore.StronglyTypedId)。

```cs
[HasStronglyTypedId]
public class Person
{
	public PersonId Id { get; set; }
	public string Name { get; set; }
}
```

### 实体建模不要面向数据库建模，而要面向业务建模

实体建模时不要优先考虑它在数据库中如何保存。比如一定要实体类的属性或字段和数据库表中的列直接对应。这样设计出的类根本不叫“实体类”，只能是“数据对象”（data object）。更不要用 DB First 反向工程。应该在不考虑数据库实现的前提下做领域模型建模，然后再使用 Fluent API 等配置方式在实体类和数据库表之间做适配。在适配过程中，可能需要对建模做妥协性修改，但是这不是一开始要考虑的。

### EF Core 实现实体：Fluent API 配置 ORM 实体关系映射的缺陷

EF Core 的 Fluent API 的本质是让 EF Core 能够“尊重”领域模型的封装，不强求领域模型为 ORM 暴露 setter 或无参构造。领域模型不需要继承 EF Core 的基类或添加特定注解，而映射配置则在基础设施层的 `OnModelCreating()` 方法中，领域层对 EF Core 的存在是“无知”的。这在 DDD 实践中是“持久化透明”（Persistence Ignorance）的一种折中实现。

然而，这种做法有三个问题：

1. 领域模型无法做到“完全无知”：领域实体仍然需要配合 EF Core 的某些要求（如参数顺序与属性名匹配，或保留私有无参构造函数）；
2. 复杂映射场景力不从心：当领域模型与数据库结构差异较大时（如多态继承、复杂关系映射），Fluent API 的配置会迅速膨胀，可维护性下降；
3. 层与层的边界模糊：当领域实体直接作为 `DbSet<T>` 使用时，应用层或基础设施层可能绕过领域服务直接操作实体状态，破坏聚合的不变性约束。

EF Core Fluent API 能够有效支持领域实体作为持久化模型的“轻度分离”方案，适合中小型项目或对性能要求较高的场景。但如果追求严格的 DDD 分层架构（完全的“持久化透明”），更推荐采用“两套模型+显式转换”的策略：领域实体位于领域层，持久化实体位于基础设施层，而仓储服务则负责两者之间的转换。这种方案的代价是增加了代码量，但获得了完全的关注点分离。

### EF Core 虽好，但须优先保证更底层的 C# 语义

优先保证更底层的 C# 语义，EF Core 会按照 C# 语义做动作，所以 C# 语义明确了的信息 EF Core 不需要重复指明。比如用户必须要有姓名，应该在用户类定义一个不可空的字符串属性 `string UserName`，而不是在 EF Core 的实体类型配置中写 `builder.Property(e=>e.UserName).IsRequired()`。

## 值对象

- 值对象（Value Object）：没有标识符的对象，也有多个属性，依附于某个实体对象而存在。比如“商家”这个实体的“地理位置”、“衣服”这个实体的“RGB颜色”都是值对象。
- 定义为值对象和实体的区别：体现整体关系。实体和值对象是整体和部分的关系。值对象是实体的一部分。

商家的地理位置作为商家的一个描述性组成部分存在，因此通常建模为值对象。

商家的员工拥有员工ID，即使其职位、部门等属性变了，我们仍能通过员工ID识别是同一个员工；而且这个ID是全局的，即使商家倒闭了，也能通过这个ID找到这员工，因此员工是实体。

### EF Core 实现值对象

比如说“商品”实体中的“重量”属性，一般来说把它单独定义为 double 类型，看起来没什么问题，但是其实背后隐含了一个“重量单位”的领域知识，我们需要在文档中把这个领域知识记下来，这下文档和代码也需要同步，耦合紧密了。

解决方案：定义一个包含数值 `Value` 和单位 `Unit` 的重量 `Weight` 类型，然后把“商品”的重量属性都设置为 `Weight` 类型。

```cs
class Weight
{
	double Value;
	WeightUnit Unit;
}

enum WeightUnit {G, KG, JIN};
```

很多值对象属性其实都隐含了单位或者其他附加信息，比如“金额”隐含了“币种”信息。每个商品（实体）都和一个重量（值对象）绑定，重量和商品是组合关系，重量组合于商品。值对象和实体之间的关系不是实体与实体之间的关系，它们是两码事。

值对象的好处：值对象把有紧密关系的属性打包为一个独立的类型，提高了内聚度，符合“高内聚、低耦合”的原则。值对象把领域知识放到类的定义中，免得在文档或注释中还要多做解释，使得代码更加“语义化”。

EF Core 实现值对象：

1. 从属实体类型（owned entities）：使用 Fluent API 中的 `OwnsOne()` 等方法配置。
2. EF Core 可以处理枚举类型，默认是以整数类型保存的。但对于直接操作数据库的人员来说，0、1 和 2 这样的整数值没有 CNY、USD 和 NZD（新西兰元）等字符串值可读性更强。因此，EF Core 的 Fluent API 提供了 `HasConversion<string>()` 把枚举类型的值保存为字符串。

### 值对象和实体的结构关系是组合关系

值对象与实体的关系是“组合关系”（composition），值对象是实体的不可分离的组成部分。为什么不是聚合关系？聚合关注的是多个实体之间的协作与一致性。值对象是实体的组成部分，不是协作成员。与聚合关系相比，组合关系的联系更紧密。

## 贫血模型和充血模型

贫血模型和充血模型讲的是怎样设计一个数据载体类，具体：

- 贫血模型：一个类中只有属性或者成员变量，没有方法。
- 充血模型：一个类中既有属性和成员变量，也有方法。这些方法实现了该类的属性和成员变量的领域知识。

贫血模型的坏处：需求是用户必须要有姓名，但是贫血模型的用户刚创建时什么也没有，这时用户用的是非法对象，造成安全隐患，要用判断打补丁。

充血模型的好处：充血模型通过有参构造方法，在一开始就确保系统中一定没有非法状态的对象，从而减少使用前判断的校验代码。

充血模型的要求：

1. 属性是只读的，或者是只能被类内部的代码修改。
2. 定义有参数的构造方法。
3. 有的成员变量没有对应属性，但是这些私有成员变量需要映射为数据表中的列，用EF Core需要手动配置。
4. 有的属性的值是数据库生成的，是只读的，也就是它的值是从数据库中读取出来的，我们不能修改这个值。
5. 有的属性不需要映射到数据列，仅在运行时被使用。

充血模型的实现：充血模型可以保证业务逻辑代码清晰明确，让人一看就懂：跟实体本身属性有关的代码都封装到类的方法里面了，业务逻辑中只需要调用相应的方法就行了。

- 贫血模型不用设计方法，一开始用起来很爽，但后面每次使用类时都要写操作实体本身的逻辑，越来越难受；
- 充血模型初期设计要考虑实体本身初始化、状态管理等逻辑，而且不能无缝映射到EF Core，前期设计和配置比较麻烦，但后面越用越爽。

### EF Core 实现充血模型

需求：定义一个类保存用户的用户名、密码、积分；用户必须具有用户名；为了保证安全，密码采用密码的散列值保存；用户的初始积分为10分；每次登录成功奖励5个积分，每次登录失败扣3个积分。

对于这个需求，充血模型类怎么设计方法：

- 只提供需要用户名参数的构造方法
- ChangePassword()方法：计算密码参数的散列值并保存到内部字段
- CheckPassword()方法：检查密码参数是否正确
- DeductCredits()方法：减少指定个数的积分，如果要减到负数，提示不能减了
- AddCredits()方法：增加指定个数的积分

EF Core 如何逐条实现充血模型的要求：

1. 属性是只读的，或只能被类内部代码修改。
	- 实现：把属性的 setter 定义为 private set 或 init，用构造方法初始化属性。
	- EF Core 通过反射直接获取私有成员变量的值，不通过 setter。
2. 定义有参构造方法。
	- 实现1：无参构造方法定义为 private，程序不能通过一般方式访问，只能像 EF Core 一样通过反射访问，相当于 EF Core 专用的无参构造方法。
	- 实现2：实体类中不定义无参构造方法，只定义有参构造方法，但参数名要与属性名一致。原理：EF Core 的反射要求有参构造方法的参数名与属性名一致（当然类型也要一致）。
	- 一般用实现1，因为比较简单。
1. 把不为属性的字段映射为数据列。
	- 实现：EF Core 配置 `builder.Property("字段名")`。
2. 要从数据列中读取值的只读属性，如 `Id`。
	- 实现：EF Core 中提供了“支持字段”或“后备字段”（backing field）来支持这种写法，在配置实体类时，使用 `HasField("字段名")` 来配置属性的支持字段，这样读写时使用就直接是属性背后的支持字段，而不必经过属性的 getter 和 setter 逻辑。
3. 有的属性不需要映射到数据列，仅在运行时被使用。
	- 实现：使用 `Ignore()` 来配置忽略这个属性。

### EF Core 会尝试直接操作属性背后的成员变量

基于性能和特殊功能支持的考虑，EF Core在读写属性的时候，如果可能它会直接跳过属性的getter和setter，而直接操作真正存储属性值的成员变量。

- 如果可能，EF Core会直接通过反射读取编译器为属性生成的成员变量的值，而不是调用属性的getter。除非你自定义了属性背后的成员变量名，让它和属性不相对应，EF Core找不到该成员变量，只好调用getter。
- EF Core会尝试按照命名规则去直接读写属性对应的成员变量，只有无法根据命名规则找到对应成员变量的时候，EF Core才会通过属性的get、set代码块来读写属性值。
	- 可以在FluentAPI中通过`UsePropertyAccessMode()`方法来修改默认的这个行为。

> C#编译器为属性`PropA`生成的成员变量名一般为`<PropA>k__BackingField`，Getter和Setter方法名一般为`get_PropA()`和`set_PropA`。如果你完整地声明了该属性（包括属性背后的成员变量），编译器就不会也不需要补充该成员变量。

### EF Core 属性映射策略

EF Core 默认只映射公共属性，不直接映射字段。如果你确实需要映射一个没有对应属性的纯字段，可使用 `Property` 方法：

```cs
rotected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<SomeEntity>()
        .Property("_someField"); 
}
```

另外，这是 EF Core 的属性映射策略，而不是属性访问策略，要注意区别。

### EF Core 属性访问策略

EF Core 默认优先访问支持字段，如果没找到则访问属性。

为什么 EF Core 的属性访问策略是这样？应该从分层架构的角度来看这个问题。访问属性就意味着必须经过属性的 getter 和 setter 逻辑，也就是需要遵守属性的只读或只写逻辑。EF Core 关心的是属性的仓储层逻辑，它把属性的值读出来或写进去都是跟数据库打交道，而不是跟业务逻辑打交道，而属性的只读或只写逻辑是业务逻辑层需要关心的，这些上层的逻辑根本管不着底层的仓储层的读写行为。所以看起来 EF Core 的读写权限很高，而这只是因为它更底层。

### EF Core 可以自动识别遵循常见命名约定的支持字段

虽然 EF Core 默认不直接映射孤立的字段，但它能够智能地识别支持字段。如果你有一个属性 `Name` 和一个按照命名规范定义的字段 `_name`，EF Core 会自动发现它。即使属性是只读的，EF Core 也可以在从数据库加载数据时绕过属性，直接通过反射写入字段。

EF Core 常见的支持字段的自动识别模式：`name`、`_name`、`_fname` 和 `m_name`。

### `HasField()`方法显式指定支持字段

如果你的支持字段命名比较刁钻，使用 `HasField` 方法可以指定任意名称的字段作为“支持字段”绑定到指定的属性。假设你有一个实体类像这样：

```cs
public class Person
{
    private string _pname;
    public int Id { get; set; }
    public string Name
    {
        get => _pname;
        set => _pname = value;
    }
}
```

如果你希望 EF Core 将 `_pname` 字段看作是 `Name` 属性的支持字段，你可以在 `OnModelCreating()` 方法中使用 `HasField()` 方法来指定这一点：

```cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
                .Property(p => p.Name)
                .HasField("_pname");
}
```

### `SetPropertyAccessMode()`方法指定属性访问策略

你可以通过实体配置的 `SetPropertyAccessMode()` 方法控制 EF Core 在读写数据时是优先使用字段还是属性，这在需要执行复杂的 setter 逻辑时非常有用。

```cs
modelBuilder.Entity<SomeEntity>()
    .SetPropertyAccessMode(PropertyAccessMode.Field);
```

| 模式          | 说明                                                              |
| ------------- | ----------------------------------------------------------------- |
| `Property`    | 始终通过属性访问，如果无法访问则报错。用于执行 getter 和 setter。 |
| `Field`       | 始终通过字段访问，跳过属性逻辑。                                  |
| `PreferField` | （默认）优先使用字段，如果没找到则用属性。加载数据时常用。        |

## 领域事件和集成事件

DDD 中的事件分为两种类型：领域事件和集成事件。

- 领域事件(Domain Events)：在同一个微服务内的聚合之间的事件传递。使用进程内的通信机制完成。详见MediatR实现领域事件。
- 集成事件(Integration Events)：跨微服务的事件传递。使用事件总线（Event Bus）实现。详见RabbitMQ实现集成事件。

库存微服务对采购微服务说“请采购”，这用的就是集成事件。

### 事务脚本（伪代码）

事务脚本就是用技术人员的语言去描述和实现业务事务。它没有太多设计，没有考虑可扩展性、可维护性，是流水账式地编写代码。事务脚本的问题：代码的可维护性、可扩展性非常差。比如怎么基于“取钱”的现有流程增加“取款金额大于5万元需要主管审批”“短信通知”等业务流程。

```cs
string Withdraw(string account, double amount)
{
	if(!this.User.HasPermission("Withdraw")) return "当前柜员没有取钱权限":

	double? balance = Query($"select Balance from Accounts where Number={account}");
	if(balance == null) return "账号不存在";
	if(balance < amount) return "账号余额不足";
	
	Query($"Update Accounts set Balance=Balance-{amount} where Number={account}");
	return "ok";
}
```

### 事务脚本处理“事件”

- 事件：“当发生某事件的时候，执行某个动作”。
- 当有人回复了用户的提问的时候，系统就向提问者的邮箱发送通知邮件。事务脚本的实现：

```cs
void 保存答案(long id, string answer)
{
	保存到数据库(id, answer);
	string email = 获取提问者邮箱(id);
	发送邮件(email，"你的问题被回答了");
}
```

事务脚本设计的程序有许多问题：

1. 代码会随着需求的增加而持续膨胀，最终变为屎山。
2. 代码的可扩展性低。开闭原则：对扩展开发，对修改封闭。在不修改已有代码的情况下，增加新的功能。
3. 容错性差。外部系统并不总是稳定的。

### C#事件机制处理事件

C#事件机制的优点：关注点分离；容易扩展；容错性好。采用C#事件机制的伪代码：

```cs
void 保存答案(long id,string answer)
{
	long aId = 保存到数据库(id,answer);
	发布事件("答案已保存",aId,answer);
}
```

```cs
[绑定事件("答案已保存")]
void 审核答案(long aId,string answer)
{
	if(检查是否疑似违规(answer)) 隐藏答案(aId);
	发布事件("内容待审核",aId);
}
```

```cs
[绑定事件("答案已保存")]
void 发邮件给提问者(long aId,string answer)
{
	long qId = 获取问题Id(aId);
	string email=获取提问者邮箱(qId);
	发送邮件(email,"你的问题被回答了");
}
```

## MediatR 进程内消息传递

朴素的 C-sharp 事件机制实现：缺点是需要显式地注册，不太灵活。

MediatR 是一款实现进程内消息传递的开源库，它将事件的发布和处理解耦，支持“一个发布者对应一个处理者”和“一个发布者对应多个处理者”两种模式。MediatR 的 NuGet 包名是 `MediatR.Extensions.Microsoft.DependencyInjection`。

1. 发布者需要实现 `INotification` 接口，且一般使用 `record` 声明。
2. 处理者需要实现 `INotificationHandler<TNotification>` 接口，其中泛型参数 `TNotification` 就是处理者要处理的消息类型。重写其中的 `Handle()` 方法实现处理逻辑。
3. 在发布者中注入 `IMediator` 服务，并调用 `Publish()` 方法发布消息。`Send()` 方法是一对一发送，`Publish()` 是一对多发送。

## 领域事件的发布时机

### 时机1：立即发布

在聚合根实体的 `ChangeName` 方法、构造方法等中立即发布领域事件，这样做可以保证领域事件不会被漏掉。缺点是：

1. 存在重复发送的情况。
2. 存在发送太早的情况。
3. 存在“误报”的情况：有可能在实体的构造方法中发送之后，数据验证没通过，最终没有把该实体保存到数据库中，导致“误报”。

### 时机2：延迟到上下文保存时发布

微软开源的 `eShopOnContainers` 项目中的做法：把领域事件的发布延迟到上下文保存修改时。实体中只是注册要发布的领域事件，然后在上下文的 `SaveChanges` 方法被调用时，我们再发布事件。

实现：提供一个供聚合根事件注册的接口 `IDomainEvents`，以及简化 `IDomainEvents` 实现的基类 `BaseEntity`，提供该接口的一些基础实现，并让所有的 `DbContext` 类继承该基类。

```cs
public interface IDomainEvents
{
	IEnumerable<INotification> GetDomainEvents();
	void AddDomainEvent(INotification eventItem);
	void AddDomainEventIfAbsent(INotification eventItem);
	void ClearDomainEvents();
}
```

## MediatR 实现领域事件

我们采用延迟到上下文保存时发布领域事件的方案，配合MediatR：

```cs
public async override Task<int> SaveChangesAsync(/*...*/)
{
	//获取所有含有未发布事件的实体
	var domainEntities = this.ChangeTracker.Entries<IDomainEvents>()
		.Where(x => x.Entity.GetDomainEvents().Any());
	//获取所有待发布消息
	var domainEvents = domainEntities.SelectMany(x => x.Entity.GetDomainEvents()).ToList();
	//清除实体中的待发布消息
	domainEntities.ToList().ForEach(entity => entity.Entity.ClearDomainEvents());
	//将待发布消息全部发布
	foreach (var domainEvent in domainEvents)
		await mediator.Publish(domainEvent);
	//执行默认SaveChangesAsync操作
	return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
}
```

## RabbitMQ 实现集成事件

集成事件是跨微服务的事件，通过事件总线（Event Bus）传递事件消息。RabbitMQ 是专门用于跨微服务传递事件消息微服务，充当两个微服务之间消息传递的第三方“信使”，也称“消息中间件”（也是一个运行在另一台服务器上的微服务）。

集成事件是服务器之间的通信，所以必须借助第三方服务器作为事件总线。常用的消息中间件有 Redis、RabbitMQ、Kafka、ActiveMQ 等。其中 RabbitMQ 在 .NET 中用得比较多，于是本篇介绍 RabbitMQ。

### RabbitMQ 的几个基本概念

1. 信道（Channel）：信道是消息的生产者、消费者和服务器通信的虚拟连接。TCP 连接的建立非常消耗资源，所以 RabbitMQ 在 TCP 连接的基础上构建了虚拟的信道，这些虚拟的信道可以用完就关，但这个 TCP 连接自始至终存在，从而尽量重复利用每个 TCP 连接。
2. 队列（Queue）：队列是用来收发消息的地方，生产者把消息放到队列中，消费者从队列中拿取消息。
3. 交换机（Exchange）：交换机负责把消息路由到一个或多个队列中。

### Routing 工作模式

RabbitMQ 有很多工作模式，常用的一个模式是路由模式（routing）。

- 生产者把消息发送给交换机，这消息会携带一个 routingKey 属性，交换机会根据这个属性的值把消息发送到一个或多个队列中。每个队列根据交换机和 routingKey 绑定一种或多种消息。
- 消费者从队列中获取消息。
- 交换机和队列都位于 RabbitMQ 服务器内部。

![RabbitMQ的路由模式](https://img.xicuodev.top/2026/05/01a6deb7ebe307f354ecd665fc692a0d.png "RabbitMQ的路由模式")

路由模式的优点：即使消费者不在线，消费者相关的消息也会保存在队列中，当消费者上线后，消费者就可以从队列中获取到离线期间错过的消息。

这种设计体现了“面向失败编程”的思想，系统不可能永远正常工作，一定会有宕机的时候，设计系统时必须面向这点考虑，设计出即使宕机也依然保证高可用性的系统。

### 使用 RabbitMQ

在信使服务器上安装 RabbitMQ 服务，在生产者和消费者服务器上安装 NuGet 包 `RabbitMQ.Client`。具体做法参考官方文档。

### 消息确认 Ack

消费者消费完消息之后，需要给 RabbitMQ 发送一个确认回执（Ack），RabbitMQ 才会认为这个消息处理完了。否则，RabbitMQ 会自动超时重发这个消息。或者消费者处理过程中发生异常，它可以主动拒绝（Reject）这个消息，让 RabbitMQ 重新发送。

### 队列由谁创建

生产者和消费者都可以创建队列，谁负责创建取决于谁的生命周期更早。

### `Zack.EventBus`简化集成事件

`Zack.EventBus` 是杨中科开发的一个简化 RabbitMQ 集成事件的 .NET 软件包框架，他是这么说的：

每次都使用 RabbitMQ 原始代码太麻烦，于是杨中科参考并改进了微软开源的 `eShopOnContainers`，开发了简化集成事件的开发包 `Zack.EventBus`，并且简化了以后迁移到其他 MQ 服务器的工作量。

1. 创建两个 ASP.NET Core Web API 项目，它们分别是发布和消费集成事件的项目，然后我们为这两个项目都安装 NuGet 包 `Zack.EventBus`。
2. 在两个项目中的 `Program.cs` 文件中的 `builder.Build()` 上面增加配置 `IntegrationEventRabbitMQOptions` 和调用 `AddEventBus` 的代码，然后在它下面调用 `UseEventBus()`。

```cs
builder.Services.Configure<IntegrationEventRabbitMQOptions>(o=>{
	o.HostName = "127.0.0.1";
	o.ExchangeName = "exchangeEventBusDemo1";
});
builder.AddEventBus("queue1",Assembly.GetExecutingAssembly());
var app = builder.Build();
builder.UseEventBus();
```

3. 在需要发布集成事件的类中注入 `IEventBus` 服务，然后调用 `IEventBus` 的 `Publish` 方法发布消息。
4. 创造一个实现了 `IIntegrationEventHandler` 接口的类，这个类用来处理收到的事件。通过 `[EventName("UserAdded")]` 设定类监听的事件。

进一步使用 `Zack.EventBus`：

1. `JsonIntegrationEventHandler`（强类型事件参数）和 `DynamicIntegrationEventHandler`（动态类型事件参数）。
2. RabbitMQ等消息中间件的消息发布和消费的过程是异步的，也就是消息发布者将消息放入消息中间件就返回了，并不会等待消息的消费过程，因此集成事件不仅能够降低微服务之间的耦合度，还能够起到“削峰填谷”的作用，避免一个微服务中的突发请求导致其他微服务雪崩的情况出现；而且消息中间件的失败重发机制可以提高消息处理的成功率，从而保证事务的“最终一致性”。
3. 最终一致性的事务：需要开发人员对流程进行精细的设计，甚至有时候需要引入人工补偿操作。不像强一致性事务那样是纯技术方案。像京东、淘宝那样的电商平台技术上订单处理失败了，都需要店小二、客服介入。
4. 其他最终一致性事务的开源框架：CAP（支持 Rabbit MQ、数据库、Redis 等）。

`Zack.EventBus` 源码解析：[源代码仓库](https://github.com/yangzhongke/NETBookMaterials/tree/main/%E6%9C%80%E5%90%8E%E5%A4%A7%E9%A1%B9%E7%9B%AE%E4%BB%A3%E7%A0%81/YouZack-VNext/Zack.EventBus)

- `RabbitMQConnection` 类提供的是 RabbitMQ 连接的失败重连机制
- `SubscriptionsManager` 类提供的是事件处理的注册和事件的分发机制，从而使得同样一个领域事件可以被微服务内多个事件处理者收到，`SubscriptionsManager` 使用 `Dictionary` 来记录注册的事件处理者，其中的 `AddSubscription(string eventName, Type eventHandlerType)` 方法用来供把 `eventHandlerType` 指定的事件处理类注册为 `eventName` 事件的处理类
- `ServicesCollectionExtensions` 类中的 `AddEventBus` 方法用来把集成事件处理类注册到 `SubscriptionsManager` 中，它会扫描指定程序集中所有实现了 `IIntegrationEventHandler` 接口的类，然后读取类上标注的所有 `[EventName]`，把指定监听的事件注册到 `SubscriptionsManager` 中
- `RabbitMQEventBus` 类用来进行事件的注册和分发

`Zack.EventBus` 框架中就是用 `eventName` 作为 RabbitMQ 的 `routingKey`。

## 洋葱架构

洋葱架构（整洁架构）是领域驱动设计的一种常用的落地方式。洋葱架构是一种分层架构，它的主要内容是：

- 内层的部分比外层的部分更加的抽象 → 内层表达抽象，外层表达实现。越往里越抽象，越往外越具体。
- 外层的代码只能调用内层的代码，内层的代码可以通过依赖注入的形式来间接调用外层的代码（通过依赖注入在运行时决定内层接口所依赖的外层实现）。

![洋葱架构](https://img.xicuodev.top/2026/05/a582aef8268074d627d9ba727a33966a.png "洋葱架构")

举一个简单的例子：读取文件然后发送邮件。新建一个接口类库 `Intf1`，里面包含 `EmailInfo` 实体类、`IEmailSender` 类、`IEmailDataProvider` 类和 `MyBizCode1` 业务类；再新建一个控制台项目 `ConsoleApp1`，里面包含 `MyEmailDataProvider1` 实现类、`MyEmailDataProviderMock1` 模拟类、`MyEmailSender` 实现类和 `Program` 程序入口类。

在这个例子中，`ConsoleApp1` 项目直接依赖于 `Intf1` 类库，`ConsoleApp1` 是具体实现，`Intf1` 是抽象接口，所以 `Intf1` 在内层，`ConsoleApp1` 在外层。

### 防腐层 ACL

代码的“腐化”：外部服务一旦改变，核心业务代码也要跟着变动，就叫原来的业务代码发生了“腐化”。

外部服务（短信服务、邮件服务、存储服务等）的变化会比较频繁。防腐层（Anti-Corruption Layer）把这些服务定义为接口，在内层代码中只定义使用接口，在外层代码中定义接口的实现。体现的仍然是洋葱架构的理念。

### 洋葱架构的项目分层结构

- Domain（领域）：实体类、事件、防腐层接口、仓储接口、领域服务。
- Infrastructure（基础设施）：实体类的配置、数据库上下文（DbContext）、防腐层接口实现、仓储接口实现。
- WebAPI（用户接口）：控制器（Controller）、事件（领域事件、集成事件）的响应类。

### 技术选型：是否需要创建应用服务层和用户界面层？

对于 ASP. NET Core Web API 项目来讲，是否需要拆分出应用服务层和用户界面层？

- 有的人认为前端代码是用户界面，而 Web API 的控制器代码就是应用服务；
- 有的人认为控制器也是一种用户界面，因此需要再拆分出来一个应用服务层，由控制器调用应用服务层。

杨中科老师赞同前者，后者会导致控制器太瘦了，显得很没必要。

## 洋葱架构实战：用户登录和管理后台系统

需求：一个包含用户管理、用户登录功能的微服务，系统的后台允许添加用户、解锁用户、修改用户密码等；系统的前台允许用户使用手机号加密码进行登录，也允许用户使用手机号加短信验证码进行登录；如果多次尝试登录失败，则账户会被锁定一段时间；为了便于审计，无论是登录成功的操作还是登录失败的操作，我们都要记录操作日志（给老板等不懂技术的人看的审计日志）。

为了简化问题，这个案例中没有对于接口调用进行鉴权，也没有防暴力破解等安全设置。

### 项目架构示例

```
Users.Domain <-- Users.Infrastructure
^                ^
|                |
Users.WebAPI -----
```

- `Users.Domain`（领域）定义了所有领域模型（在数据库语境中叫“实体类”）。
- `Users.Infrastructure`（基础设施）提供操作数据库、短信发送等具体的泛用性强的实现。
- `Users.WebAPI` （用户接口，UI）对客户提供微服务的接口。

在这个洋葱模型中，`Users.Domain` 在最内层，`Users.Infrastructure` 在中间层，`Users.WebAPI` 在最外层。

### 项目结构示例

![洋葱架构示例项目结构](https://img.xicuodev.top/2026/05/d5ba3c1f28975f9fffb1ef34720e18fb.png "洋葱架构示例项目结构")

像 `HashHelper` 这样的工具类最好放到基础设施 `Users.Infrastructure` 中，图中放到 `Users.Domain` 不妥。其实图中还有很多严格来说放错了地方的类，但这只是个简化版的示例，主要目的还是理解洋葱架构。

### 领域模型和领域服务的设计

- 用户 `User` 实体类：没有基于 `Identity` 框架，因为学习需要。
- “用户登录失败次数过多则锁定”这个需求并不属于“用户”实体的常用特征，因此把它拆分到一个单独的 `UserAccessFail` 实体中。
- 用户登录记录 `UserLoginHistory` 也应该识别为一个单独的实体，理由同上。
- 把 `User` 和 `UserAccessFail` 设计为同一个聚合，并且把 `User` 设为聚合根，因为它们关系密切，生命周期高度重合。
- 有单独查询一段时间内登录记录等这样独立于某个用户的需求，因此要把 `UserLoginHistory` 设计为一个单独的聚合。
- `DbContext` 要定义到基础设施层。

#### 手机号应当设计为值对象

考虑到系统可能被海外用户访问，手机号需要包含“国家/地区码”，因此需要把手机号设计为值对象 `PhoneNumber`。

应当把 `PhoneNumber` 类放入 `ValueObjects/`（值对象）目录中，上面的项目结构示例图把它放在 `Entities/`（实体）目录中是不合理的。

```cs
public record PhoneNumber(int RegionCode, string Number);
```

### `IUserRepository`仓储接口的设计

仓储接口的定义应当放在领域模型层中，它是领域模型的一部分，一个领域模型对应一个仓储接口。不建议使用通用的仓储接口 `CRUDRepository`，避免陷入“伪 DDD”的误区。[202601091045-仓储和工作单元](202601091045-仓储和工作单元.md)。

```cs
public interface IUserRepository
{
	Task<User?> FindOneAsync(PhoneNumber phoneNumber);
	Task<User?> FindOneAsync(Guid userId);
	Task AddNewLoginHistoryAsync(PhoneNumber phoneNumber, string msg);
	Task PublishEventAsync(UserAccessResultEvent eventData);
	Task SavePhoneCodeAsync(PhoneNumber phoneNumber, string code);
	Task <string?> RetrievePhoneCodeAsync(PhoneNumber phoneNumber);
}
```

#### 关于发布事件的设计

笔者的想法是建一个 `UserEventPublisher` 类来专门发布领域事件或集成事件，然后在 `UserService` 类中开放调用它的方法。但是在这个示例中，为简化设计，杨老师把发布事件的逻辑放在了 `IUserRepository` 仓储层接口中（`PublishEventAsync` 方法）。

### `ISmsCodeSender`防腐层接口的设计

短信验证码依赖发送短信验证码的外部服务，后者往往需要变动，因此定义 `ISmsCodeSender` 接口作为防腐层接口。防腐层接口一般放在领域服务层中。

```cs
public interface ISmsCodeSender
{
	Task SendAsync(PhoneNumber phoneNumber, string code);
}
```

### `UserService`领域层服务的设计

用户的领域层服务 `UserService` 依赖它的仓储接口 `IUserRepository` 和防腐层接口 `ISmsCodeSender`，以下是它的方法：

- `UnlockIfPossible` 和 `FailOnce` 方法：对用户登录锁定相关方法的封装
- `LoginWithPasswordAsync` 方法：通过密码登录
- `LoginWithSmsCodeAsync` 方法：通过短信验证码登录
- `SendSmsCodeAsync` 方法：发送短信验证码
- `RegisterWithSmsCodeAsync` 方法：通过短信验证码注册

```cs
public class UserService
{
	private readonly IUserRepository repository;
	private readonly ISmsCodeSender smsSender;
	
	public UserService(IUserRepository repository, ISmsSender smsSender) 
	{  
	    _repository = repository;  
	    _smsSender = smsSender;  
	}  
	
	public static bool UnlockIfPossible(User user) => user.AccessFailure.UnlockIfPossible();  
	public static void FailOnce(User user) => user.AccessFailure.FailOnce();  
	
	private static bool IsPasswordValid(string inputPassword) => inputPassword.Length >= 6;
    private static bool IsSmsCodeValid(string inputSmsCode) => inputSmsCode.Length == 4;

    public async Task<UserAccessResult> LoginWithPasswordAsync(PhoneNumber phoneNumber, string password)
    {
        UserAccessResult result;
        User? user = null;
        if (!phoneNumber.IsFilled()) result = UserAccessResult.PhoneNumberUnfilled;
        else if (!phoneNumber.IsValid()) result = UserAccessResult.PhoneNumberInvalid;
        else if (string.IsNullOrWhiteSpace(password)) result = UserAccessResult.PasswordUnfilled;
        else if (!IsPasswordValid(password)) result = UserAccessResult.PasswordInvalid;
        else
        {
            user = await _repository.FindOneAsync(phoneNumber);
            if (user is null) result = UserAccessResult.PhoneNumberNotFound;
            else if (!UnlockIfPossible(user)) result = UserAccessResult.UserLockedTemporarily;
            else if (!user.CheckPassword(password)) result = UserAccessResult.PasswordIncorrect;
            else result = UserAccessResult.Ok;
        }

        if (user is not null && result is not UserAccessResult.Ok) FailOnce(user);
        await _repository.PublishUserAccessEventAsync(new UserAccessEvent(phoneNumber, result));
        return result;
    }

    public async Task<UserAccessResult> LoginWithSmsCodeAsync(PhoneNumber phoneNumber, string smsCode)
    {
        UserAccessResult result;
        User? user = null;
        if (!phoneNumber.IsFilled()) result = UserAccessResult.PhoneNumberUnfilled;
        else if (!phoneNumber.IsValid()) result = UserAccessResult.PhoneNumberInvalid;
        else if (string.IsNullOrWhiteSpace(smsCode)) result = UserAccessResult.SmsCodeUnfilled;
        else if (!IsSmsCodeValid(smsCode)) result = UserAccessResult.SmsCodeInvalid;
        else
        {
            user = await _repository.FindOneAsync(phoneNumber);
            if (user is null) result = UserAccessResult.PhoneNumberNotFound;
            else if (!UnlockIfPossible(user)) result = UserAccessResult.UserLockedTemporarily;
            else
            {
                var correctSmsCode = await _repository.FindSmsCodeAsync(phoneNumber);
                if (string.IsNullOrWhiteSpace(correctSmsCode)) result = UserAccessResult.SmsCodeNotFound;
                else if (!string.Equals(smsCode, correctSmsCode)) result = UserAccessResult.SmsCodeIncorrect;
                else result = UserAccessResult.Ok;
            }
        }

        if (user is not null && result is not UserAccessResult.Ok) FailOnce(user);
        await _repository.PublishUserAccessEventAsync(new UserAccessEvent(phoneNumber, result));
        return result;
    }

    public async Task<UserAccessResult> SendSmsCodeAsync(PhoneNumber phoneNumber)
    {
        UserAccessResult result;
        if (!phoneNumber.IsFilled()) result = UserAccessResult.PhoneNumberUnfilled;
        else if (!phoneNumber.IsValid()) result = UserAccessResult.PhoneNumberInvalid;
        else
        {
            var code = Random.Shared.Next(1000, 9999).ToString();
            await _repository.SaveSmsCodeAsync(phoneNumber, code);
            await _smsSender.SendAsync(phoneNumber, code);
            result = UserAccessResult.SmsCodeSent;
        }

        return result;
    }

    public async Task<UserAccessResult> RegisterWithSmsCodeAsync(PhoneNumber phoneNumber, string smsCode)
    {
        UserAccessResult result;
        if (!phoneNumber.IsFilled()) result = UserAccessResult.PhoneNumberUnfilled;
        else if (!phoneNumber.IsValid()) result = UserAccessResult.PhoneNumberInvalid;
        else if (string.IsNullOrWhiteSpace(smsCode)) result = UserAccessResult.SmsCodeUnfilled;
        else if (!IsSmsCodeValid(smsCode)) result = UserAccessResult.SmsCodeInvalid;
        else
        {
            var user = await _repository.FindOneAsync(phoneNumber);
            if (user is not null) result = UserAccessResult.PhoneNumberAlreadyExists;
            else
            {
                user = new User(phoneNumber);
                await _repository.AddAsync(user);
                result = UserAccessResult.Ok;
            }
        }
        
        await _repository.PublishUserAccessEventAsync(new UserAccessEvent(phoneNumber, result));
        return result;
    }
}
```

### `UnitOfWork`工作单元的设计

工作单元是由应用服务层（本例中为 `User.WebAPI`）来确定的，而其他任何层（比如仓储层）都不应该调用 `SaveChangesAsync` 方法保存对数据的修改。[202601091045-仓储和工作单元](202601091045-仓储和工作单元.md)。

可以开发一个在控制器的方法调用结束后自动调用 `SaveChangesAsync` 的过滤器（`Filter`）：`UnitOfWorkAttribute` 和 `UnitOfWorkFilter`。

```cs
namespace Identity.WebAPI;

[AttributeUsage(AttributeTargets.Method)]
public class UnitOfWorkAttribute : Attribute
{
    //调用哪些DbContext的SaveChangesAsync方法
    public Type[] DbContextTypes { get; init; }
    
    public UnitOfWorkAttribute(params Type[] dbContextTypes)
    {
        DbContextTypes = dbContextTypes;
    }
}
```

```cs
namespace Identity.WebAPI;

public class UnitOfWorkFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var result = await next();
        if (result.Exception is not null) return; //Action执行异常
        if (context.ActionDescriptor is not ControllerActionDescriptor actionDescriptor) return; //向下转型失败
        var unitOfWorkAttribute = actionDescriptor.MethodInfo.GetCustomAttribute<UnitOfWorkAttribute>();
        if (unitOfWorkAttribute is null) return; //找不到工作单元注解
        foreach (var dbContextType in unitOfWorkAttribute.DbContextTypes)
            //管IoC容器要DbContext实例
            if (context.HttpContext.RequestServices.GetService(dbContextType) is DbContext dbContext)
                await dbContext.SaveChangesAsync();
    }
}
```

要使用这个注解，只需在控制器方法上加上它：

```cs
[HttpGet(Name = "GetWeatherForecast")]
[UnitOfWork(typeof(IdentityDbContext))]
public IEnumerable<WeatherForecast> Get() => DoSth();
```

这个方案需要你显式指定方法用到的 `DbContext`，可能比较麻烦，尽管你总该知道一个方法需要用到哪些 `DbContext`。

### 应用层的设计

应用层的工作是安全认证、权限校验、数据校验、事务控制、工作单元控制、数据获取、领域服务调用、领域事件监听和处理等，并没有复杂的业务逻辑，因为主要的业务逻辑都已封装在领域层了。应用层是非常薄的一层，理论上不应该有高级的业务逻辑。

#### `UserAccessEventHandler`应用层监听领域事件

在本例中，应用层需要监听登录失败或成功的领域事件 `UserAccessResultEvent`，并把它记录到 `LoginHistory`：`repository.AddNewLoginHistoryAsync(phoneNumber, msg);`

>  领域事件的处理往往是跨聚合的，所以需要把它暴露在领域层外的应用层。“一方有事，多方响应。”

```cs
namespace Identity.WebAPI;

public class UserAccessEventHandler : INotificationHandler<UserAccessEvent>
{
    private readonly IUserRepository _userRepository;
    private readonly IdentityDbContext _identityDbContext;

    public UserAccessEventHandler(IUserRepository userRepository, IdentityDbContext identityDbContext)
    {
        _userRepository = userRepository;
        _identityDbContext = identityDbContext;
    }

    public async Task Handle(UserAccessEvent notification, CancellationToken cancellationToken)
    {
        await _userRepository.AddHistoryAsync(notification.PhoneNumber, notification.Result.ToString());
        await _identityDbContext.SaveChangesAsync(cancellationToken);
    }
}
```

MediatR 的 `Handle` 方法并不是一个 Web API 的 `Action` 方法，所以之前工作单元的设计对它不起作用，你需要单独在这调用 `SaveChangesAsync` 方法。“为了避免过度设计，有时候不那么优美也可以。”

#### 应用层决定领域层接口的实现

由应用层来决定接口和实现的拼装，领域层是不知道它提供接口的实现如何的，这很好地体现了内层是抽象的。

#### 应用层的控制器设计

应用层提供几种登录方式的控制器方法，如 `LoginWithPassword` 方法：

```cs
[HttpPost]
[UnitOfWork(typeof(IdentityDbContext))]
public async Task<IActionResult> LoginWithPassword(LoginWithPasswordRequest request)
{
	var result = await _userService.LoginWithPasswordAsync(request.PhoneNumber, request.Password);
	if (result is not LoginResult.Ok) return BadRequest(result);
	return Ok(result);
}
```

应用层还提供注册的控制器方法 `Register`，用到简单的新增用户记录的数据库操作，这里就可以直接用领域层的仓储层接口，这也是洋葱架构的优点：

```cs
//未完待续
```
