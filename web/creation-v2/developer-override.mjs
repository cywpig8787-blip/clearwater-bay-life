// Explicitly separate policy; an override never mints skill funds.
export function allocationPolicy(character,{normal=false}={}){return {override:character.dev===true&&!normal,skillCap:character.dev===true&&!normal?Number.MAX_SAFE_INTEGER:75};}
