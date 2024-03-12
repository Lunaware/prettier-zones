/**
 * @package prettier-zones
 * @author methamphetqmine
 * @version 1.0.0
 */

import { Workspace, CollectionService, Players } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Signal } from "@rbxts/beacon";

interface Options {
	Tag: string;
	queryTime?: number;
}

export class Zone {
	private Objects: Array<Instance> = [];
	private lastQuery: Array<Player> = [];
	private Options: Options = { Tag: "ZONE_OBJECT", queryTime: 0.25 };
	private overlapParams: OverlapParams = new OverlapParams();
	private Maid: Trove = new Trove();

	public TagAdded: Signal<BasePart> = new Signal();
	public PlayerEntered: Signal<Player> = new Signal();
	public PlayerExited: Signal<Player> = new Signal();

	constructor(Options: { Tag: string; queryTime: number }) {
		assert(typeOf(Options) === "table", "Expected table for argument #1, got nil.");
		assert(typeOf(Options.Tag) === "string", "Options.Tag is not a valid string.");
		assert(
			typeOf(Options.queryTime) === "number" || Options.queryTime === undefined,
			"Options.queryTime is not a valid number.",
		);

		this.Options.Tag = Options.Tag;
		this.Options.queryTime = Options.queryTime !== undefined ? Options.queryTime : 0.25;

		this.Maid.connect(this.TagAdded, (Object: BasePart) => {
			while (Object.Parent) {
				Workspace.GetPartsInPart(Object, this.overlapParams).forEach((Part: BasePart) => {
					const Ancestor = Part.FindFirstAncestorOfClass("Model");
					const Humanoid = Ancestor?.FindFirstChildOfClass("Humanoid");
					const Player = Humanoid && Players.GetPlayerFromCharacter(Ancestor);

					if (Player !== undefined && !this.lastQuery.includes(Player)) {
						this.PlayerEntered.Fire(Player);
					}
				});

				task.wait(this.Options.queryTime);
			}
		});

		for (const Object of CollectionService.GetTagged(this.Options.Tag)) {
			if (Object.IsA("BasePart") === true) {
				this.Objects.push(Object);
				this.TagAdded.Fire(Object as BasePart);
			}
		}

		this.Maid.connect(Workspace.ChildAdded, (Object: Instance) => {
			if (Object.HasTag(this.Options.Tag) && Object.IsA("BasePart") === true) {
				this.Objects.push(Object);
				this.TagAdded.Fire(Object as BasePart);
			}
		});
	}

	Destroy(destroyZones?: boolean): void {
		this.Maid.destroy();

		if (destroyZones === true) {
			this.Objects.forEach((Object: Instance) => Object.Destroy());
		}

		this.Objects.clear();
	}
}
