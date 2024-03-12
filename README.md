# Prettier Zone

This project includes a `Zone` class for managing zones in a Roblox game. The class provides several features to handle interactions between players and zones.

## Features

- **Tag-based zone objects**: The class uses tags to identify zone objects. You can specify the tag when creating a new `Zone` instance.

- **Player entry and exit**: The class emits signals when a player enters or exits a zone. You can listen to these signals to handle these events in your game.

- **Zone cleanup**: The `Destroy` method allows you to clean up a zone by destroying all connections and optionally all zone objects.

## Usage

First, import the `Zone` class:

```typescript
import { Zone } from "./Zone";
```

Then, create a new `Zone` instance:

```typescript
const zone = new Zone({ Tag: "ZONE_OBJECT", queryTime: 0.5 });
```

You can listen to the `playerEntered` and `playerExited` signals:

```typescript
zone.playerEntered.connect((player) => {
  print(`${player.Name} entered the zone`);
});

zone.playerExited.connect((player) => {
  print(`${player.Name} left the zone`);
});
```

Finally, you can clean up the zone when it's no longer needed:

```typescript
zone.Destroy(true);
```

## Dependencies

This project uses several Roblox TypeScript (rbxts) services and libraries, including `@rbxts/services`, `@rbxts/trove`, and `@rbxts/beacon`.