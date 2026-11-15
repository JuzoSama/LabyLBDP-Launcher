package fr.labylbdp.fleches;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.server.level.ServerPlayer;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.TickEvent;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.IExtensionPoint;
import net.minecraftforge.fml.ModLoadingContext;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.network.NetworkConstants;

/**
 * Minecraft ne sauvegarde pas les flèches plantées dans un joueur :
 * elles disparaissent à la déconnexion. Ce mod les garde en mémoire
 * dans les données du joueur et les remet à la reconnexion.
 *
 * Mod côté serveur uniquement : les joueurs n'ont pas besoin de l'installer.
 */
@Mod(LabyFleches.MODID)
public class LabyFleches {
    public static final String MODID = "laby_fleches";
    private static final String CLE = "laby_fleches";

    public LabyFleches() {
        // Les joueurs peuvent se connecter même s'ils n'ont pas ce mod.
        ModLoadingContext.get().registerExtensionPoint(IExtensionPoint.DisplayTest.class,
                () -> new IExtensionPoint.DisplayTest(() -> NetworkConstants.IGNORESERVERONLY, (version, fromServer) -> true));
        MinecraftForge.EVENT_BUS.register(this);
    }

    private static void sauver(ServerPlayer joueur) {
        CompoundTag tag = new CompoundTag();
        tag.putInt("fleches", joueur.getArrowCount());
        tag.putInt("dards", joueur.getStingerCount());
        joueur.getPersistentData().put(CLE, tag);
    }

    /** Sauvegarde à la déconnexion. */
    @SubscribeEvent
    public void deconnexion(PlayerEvent.PlayerLoggedOutEvent event) {
        if (event.getEntity() instanceof ServerPlayer joueur) {
            sauver(joueur);
        }
    }

    /** Sauvegarde chaque seconde aussi, au cas où le serveur s'arrête brutalement. */
    @SubscribeEvent
    public void tick(TickEvent.PlayerTickEvent event) {
        if (event.phase == TickEvent.Phase.END && event.player instanceof ServerPlayer joueur && joueur.tickCount % 20 == 0) {
            sauver(joueur);
        }
    }

    /** Remet les flèches à la reconnexion. */
    @SubscribeEvent
    public void connexion(PlayerEvent.PlayerLoggedInEvent event) {
        if (!(event.getEntity() instanceof ServerPlayer joueur)) {
            return;
        }
        CompoundTag donnees = joueur.getPersistentData();
        if (!donnees.contains(CLE)) {
            return;
        }
        CompoundTag tag = donnees.getCompound(CLE);
        joueur.setArrowCount(tag.getInt("fleches"));
        joueur.setStingerCount(tag.getInt("dards"));
    }
}
