import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

export interface MultiSelectOption {
  value: string;
  label: string;
  abbreviation?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
  showAbbreviation?: boolean;
  showSelectAll?: boolean;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ 
    options, 
    selected, 
    onChange, 
    placeholder = "Select items...", 
    className,
    disabled = false,
    maxDisplay = 3,
    showAbbreviation = false,
    showSelectAll = false,
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (item: string) => {
      onChange(selected.filter((i) => i !== item))
    }

    const handleSelect = (currentValue: string) => {
      if (selected.includes(currentValue)) {
        onChange(selected.filter((item) => item !== currentValue))
      } else {
        onChange([...selected, currentValue])
      }
    }

    const handleSelectAll = () => {
      if (selected.length === options.length) {
        // If all are selected, deselect all
        onChange([])
      } else {
        // Select all options
        onChange(options.map(option => option.value))
      }
    }

    const isAllSelected = selected.length === options.length && options.length > 0
    const isPartiallySelected = selected.length > 0 && selected.length < options.length

    const getSelectedOptions = () => {
      return options.filter(option => selected.includes(option.value))
    }

    const getDisplayText = () => {
      const selectedOptions = getSelectedOptions()
      if (selectedOptions.length === 0) {
        return placeholder
      }
      
      if (selectedOptions.length <= maxDisplay) {
        return selectedOptions
          .map(option => showAbbreviation && option.abbreviation ? option.abbreviation : option.label)
          .join(", ")
      }
      
      const displayed = selectedOptions
        .slice(0, maxDisplay)
        .map(option => showAbbreviation && option.abbreviation ? option.abbreviation : option.label)
        .join(", ")
      
      return `${displayed} +${selectedOptions.length - maxDisplay} more`
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              className
            )}
            disabled={disabled}
            {...props}
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {getSelectedOptions().slice(0, maxDisplay).map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="mr-1 mb-1"
                    >
                      {showAbbreviation && option.abbreviation ? option.abbreviation : option.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(option.value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleUnselect(option.value)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                  {selected.length > maxDisplay && (
                    <Badge variant="secondary" className="mr-1 mb-1">
                      +{selected.length - maxDisplay} more
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {showSelectAll && options.length > 0 && (
                  <CommandItem
                    key="select-all"
                    value="select-all"
                    onSelect={handleSelectAll}
                    className="cursor-pointer font-medium border-b border-gray-200"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isAllSelected ? "opacity-100" : isPartiallySelected ? "opacity-50" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center">
                      <span className="text-blue-600">
                        {isAllSelected ? "Deselect All" : "Select All"}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({selected.length}/{options.length})
                      </span>
                    </div>
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {showAbbreviation && option.abbreviation && (
                        <span className="text-xs text-muted-foreground">
                          {option.abbreviation}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
