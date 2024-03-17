/**
 * @package prettier-zones
 * @author methamphetqmine
 * @version 1.0.1
 */

import { Workspace, CollectionService, Players } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Signal } from "@rbxts/beacon";

interface Options {
	Tag: string;
	queryTime?: number;
}

/**
 * Represents a zone in the game world.
 */
export class Zone {
	private Objects: Array<Instance> = [];
	private lastQuery: Array<Player> = [];
	private Options: Options = { Tag: "ZONE_OBJECT", queryTime: 0.25 };
	private overlapParams: OverlapParams = new OverlapParams();
	private Maid: Trove = new Trove();

	/**
	 * Signal that is fired when the zone tag is added to a part.
	 */
	public tagAdded: Signal<BasePart> = new Signal();

	/**
	 * Signal that is fired when a player enters the zone.
	 */
	public playerEntered: Signal<Player> = new Signal();

	/**
	 * Signal that is fired when a player exits the zone.
	 */
	public playerExited: Signal<Player> = new Signal();

	/**
	 * Creates a new Zone instance.
	 * @param Options - The options for the zone.
	 * @param Options.Tag - The tag to use for identifying parts within the zone.
	 * @param Options.queryTime - The time interval between each query for players in the zone.
	 */
	constructor(Options: { Tag: string; queryTime: number }) {
		assert(typeOf(Options) === "table", "Expected table for argument #1, got nil.");
		assert(typeOf(Options.Tag) === "string", "Options.Tag is not a valid string.");
		assert(
			typeOf(Options.queryTime) === "number" || Options.queryTime === undefined,
			"Options.queryTime is not a valid number.",
		);

		this.Options.Tag = Options.Tag;
		this.Options.queryTime = Options.queryTime !== undefined ? Options.queryTime : 0.25;

		this.Maid.connect(this.tagAdded, (Object: BasePart) => {
			while (Object.Parent) {
				const thisQuery: Array<Player> = [];

				Workspace.GetPartsInPart(Object, this.overlapParams).forEach((Part: BasePart) => {
					const Ancestor = Part.FindFirstAncestorOfClass("Model");
					const Humanoid = Ancestor?.FindFirstChildOfClass("Humanoid");
					const Player = Humanoid && Players.GetPlayerFromCharacter(Ancestor);

					if (Player !== undefined && !this.lastQuery.includes(Player)) {
						thisQuery.push(Player);
						this.playerEntered.Fire(Player);
					}
				});

				this.lastQuery.forEach((Player: Player) => {
					if (!thisQuery.includes(Player)) {
						this.playerExited.Fire(Player);
					}
				}); 

				this.lastQuery = thisQuery;
				task.wait(this.Options.queryTime);
			}
		});

		for (const Object of CollectionService.GetTagged(this.Options.Tag)) {
			if (Object.IsA("BasePart") === true) {
				this.Objects.push(Object);
				this.tagAdded.Fire(Object as BasePart);
			}
		}

		this.Maid.connect(Workspace.ChildAdded, (Object: Instance) => {
			if (Object.HasTag(this.Options.Tag) && Object.IsA("BasePart") === true) {
				this.Objects.push(Object);
				this.tagAdded.Fire(Object as BasePart);
			}
		});
	}

	/**
	 * Destroys the Zone instance.
	 * @param destroyZones - Whether to destroy the parts within the zone as well.
	 */
	Destroy(destroyZones?: boolean): void {
		this.Maid.destroy();

		if (destroyZones === true) {
			this.Objects.forEach((Object: Instance) => Object.Destroy());
		}

		this.Objects.clear();
	}
}
