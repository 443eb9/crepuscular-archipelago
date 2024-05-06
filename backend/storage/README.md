# individual-islands
            <h2 className="absolute font-bender font-bold leading-none pl-2 py-[2px] text-[10px] w-20 -top-1 left-3 text-neutral-50 dark:text-neutral-900 bg-neutral-900 dark:bg-neutral-50">{`# ${card.id}`}</h2>
            {
                card.ty == IslandType.Article && <DiagLines className="absolute right-5 size-10" scale="300%"></DiagLines>
            }
            <h1 className="font-sh-serif font-bold text-xl mb-1">{card.title}</h1>
            <div className="flex mb-2">
                <div className="w-20 h-1 bg-neutral-900 dark:bg-neutral-50"></div>
                <div className="w-4 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
                <div className="w-2 h-1 bg-neutral-900 dark:bg-neutral-50 ml-3"></div>
            </div>
            <p className="font-sh-sans text-ellipsis overflow-hidden line-clamp-6" style={{ width: "calc(100% - 80px)" }}>{card.desc}</p>

Individual islands in the crepuscular archipelago.
