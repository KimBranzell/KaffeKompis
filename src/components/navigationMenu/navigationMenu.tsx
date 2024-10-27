'use client'

import * as React from 'react'
import {
  NavigationMenu as BaseNavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

import { cn } from '@/lib/utils'

interface Props {
  data: {
    href: string;
    label: string;
    icon: string;
    subItems: Array<any>;
  }[];
}

export function NavigationMenu({ data }: Props) {
  return (
    <BaseNavigationMenu className="z-[5] m750:max-w-[300px]">
      <NavigationMenuList className="m750:max-w-[300px]">
        {data.map((item, i) => {
          return(
            <NavigationMenuItem key={`item-${i.toFixed()}`}>
              {!item.subItems ? (
                <NavigationMenuLink href={item.href}>
                  {item.label}
                </NavigationMenuLink>
              ) : (
                <>
                  <NavigationMenuTrigger className="m750:max-w-[80px]">
                    <span className="m750:hidden">{item.label}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-6 lg:grid-cols-[.75fr_1fr] m750:w-[300px]">
                      {item.subItems.map((subItem, i) => {
                        return (
                          <ListItem href={subItem.href} key={`subItem-${i.toFixed()}`} title={subItem.label}>
                            Introduction to the tool
                          </ListItem>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </BaseNavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'hover:bg-accent block text-text select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:border-border dark:hover:border-darkBorder',
            className,
          )}
          {...props}
        >
          <div className="text-base font-heading leading-none">{title}</div>
          <p className="text-muted-foreground font-base line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'