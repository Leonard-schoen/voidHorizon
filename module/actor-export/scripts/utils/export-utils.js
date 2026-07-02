/**
 * Utilitaires d'export pour voidHorizon
 * Fonctions communes utilisées par tous les providers
 */

class ExportUtils {
    constructor() {
        this.supportedFormats = ['pdf', 'json', 'html'];
        this.supportedActorTypes = ['heros', 'npc'];
    }

    /**
     * Valide qu'un acteur peut être exporté
     * @param {Actor} actor - L'acteur à valider
     * @returns {boolean} - True si l'acteur peut être exporté
     */
    canExportActor(actor) {
        return actor && 
               this.supportedActorTypes.includes(actor.type) &&
               actor.system !== undefined;
    }

    /**
     * Génère un nom de fichier pour l'export
     * @param {Actor} actor - L'acteur à exporter
     * @param {string} format - Le format d'export
     * @returns {string} - Nom de fichier généré
     */
    generateFileName(actor, format) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const actorName = actor.name.replace(/[^a-zA-Z0-9]/g, '_');
        return `voidHorizon_${actorName}_${timestamp}.${format}`;
    }

    /**
     * Télécharge un fichier
     * @param {string|Blob} content - Contenu du fichier
     * @param {string} fileName - Nom du fichier
     * @param {string} mimeType - Type MIME
     */
    downloadFile(content, fileName, mimeType) {
        let blob;
        
        if (typeof content === 'string') {
            blob = new Blob([content], { type: mimeType });
        } else {
            blob = content;
        }
        
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Calcule le mouvement disponible selon la formule voidHorizon
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Données de mouvement calculées
     */
    calculateMovement(actor) {
        const agility = actor.system.stats?.agility || 0;
        const armorType = actor.system.armor?.type || 'tissu';
        
        // Formule de base : Agilité * 1.5 + 1.5
        let baseMovement = (agility * 1.5) + 1.5;
        
        // Malus d'armure selon le type
        let armorPenalty = 0;
        switch (armorType) {
            case 'tissu':
                armorPenalty = 0;
                break;
            case 'legere':
                armorPenalty = 1.5;
                break;
            case 'lourde':
                armorPenalty = 3.0;
                break;
            case 'blindee':
                armorPenalty = 4.5;
                break;
        }
        
        const finalMovement = Math.max(6, baseMovement - armorPenalty);
        const squares = Math.round(finalMovement / 1.5);

        return {
            base: baseMovement,
            armorPenalty: armorPenalty,
            final: finalMovement,
            squares: squares,
            formula: `(${agility} × 1.5) + 1.5 - ${armorPenalty} = ${finalMovement}m (${squares} cases)`,
            details: {
                agility: agility,
                baseFormula: `(${agility} × 1.5) + 1.5`,
                armorType: armorType,
                armorPenalty: armorPenalty
            }
        };
    }

    /**
     * Obtient le nom français du type d'armure
     * @param {string} armorType - Type d'armure
     * @returns {string} - Nom français
     */
    getArmorTypeName(armorType) {
        const names = {
            'tissu': 'Tissu',
            'legere': 'Légère',
            'lourde': 'Lourde',
            'blindee': 'Blindée'
        };
        return names[armorType] || armorType;
    }

    /**
     * Obtient les informations de base d'un acteur
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Informations de base
     */
    getActorBasicInfo(actor) {
        return {
            id: actor.id,
            name: actor.name,
            type: actor.type,
            img: actor.img,
            class: actor.system.class || '',
            faction: actor.system.faction || '',
            rank: actor.system.rank || '',
            affinity: actor.system.affinity || '',
            role: actor.system.role || '',
            difficulty: actor.system.difficulty || 'normal'
        };
    }

    /**
     * Obtient les statistiques d'un acteur
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Statistiques
     */
    getActorStats(actor) {
        const stats = actor.system.stats || {};
        return {
            agility: stats.agility || 0,
            constitution: stats.constitution || 0,
            intelligence: stats.intelligence || 0,
            perception: stats.perception || 0,
            strength: stats.strength || 0,
            willpower: stats.willpower || 0
        };
    }

    /**
     * Obtient les informations de santé et d'armure
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Santé et armure
     */
    getActorHealthAndArmor(actor) {
        const health = actor.system.health || {};
        const armor = actor.system.armor || {};
        
        return {
            health: {
                current: health.current || 0,
                max: health.max || 0
            },
            armor: {
                type: armor.type || 'tissu',
                value: armor.value || 0,
                typeName: this.getArmorTypeName(armor.type || 'tissu')
            }
        };
    }

    /**
     * Obtient les objets d'un acteur
     * @param {Actor} actor - L'acteur
     * @param {Array<string>} excludeTypes - Types d'objets à exclure
     * @returns {Array} - Liste des objets
     */
    getActorItems(actor, excludeTypes = ['trait']) {
        const items = actor.items || [];
        return items
            .filter(item => !excludeTypes.includes(item.type))
            .map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                img: item.img,
                description: item.system.description || '',
                system: item.system
            }));
    }

    /**
     * Obtient les traits d'un acteur
     * @param {Actor} actor - L'acteur
     * @returns {Array} - Liste des traits
     */
    getActorTraits(actor) {
        const traits = actor.items.filter(item => item.type === 'trait') || [];
        return traits.map(trait => ({
            id: trait.id,
            name: trait.name,
            description: trait.system.description || '',
            bonus: trait.system.bonus || 0,
            system: trait.system
        }));
    }

    /**
     * Obtient la biographie d'un acteur
     * @param {Actor} actor - L'acteur
     * @returns {string} - Biographie
     */
    getActorBiography(actor) {
        return actor.system.biography || 'Aucune biographie disponible.';
    }

    /**
     * Formate une date pour l'affichage
     * @param {Date} date - Date à formater
     * @param {string} locale - Locale pour le formatage
     * @returns {string} - Date formatée
     */
    formatDate(date, locale = 'fr-FR') {
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formate un timestamp ISO pour l'affichage
     * @param {string} isoString - Timestamp ISO
     * @param {string} locale - Locale pour le formatage
     * @returns {string} - Date formatée
     */
    formatISODate(isoString, locale = 'fr-FR') {
        const date = new Date(isoString);
        return this.formatDate(date, locale);
    }

    /**
     * Valide les options d'export
     * @param {Object} options - Options à valider
     * @returns {Object} - Options validées avec valeurs par défaut
     */
    validateExportOptions(options = {}) {
        return {
            includeImage: options.includeImage !== false, // Par défaut true
            includeItems: options.includeItems !== false, // Par défaut true
            includeTraits: options.includeTraits !== false, // Par défaut true
            includeBiography: options.includeBiography || false, // Par défaut false
            format: options.format || 'pdf',
            quality: options.quality || 'high'
        };
    }

    /**
     * Crée une notification d'export
     * @param {string} message - Message de la notification
     * @param {string} type - Type de notification (success, error, warning, info)
     * @param {number} duration - Durée d'affichage en ms
     */
    showNotification(message, type = 'info', duration = 5000) {
        if (ui && ui.notifications) {
            switch (type) {
                case 'success':
                    ui.notifications.info(message);
                    break;
                case 'error':
                    ui.notifications.error(message);
                    break;
                case 'warning':
                    ui.notifications.warn(message);
                    break;
                default:
                    ui.notifications.info(message);
            }
        } else {
            // Fallback si ui.notifications n'est pas disponible
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Affiche une notification de succès
     * @param {string} message - Message de succès
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Affiche une notification d'erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Affiche une notification d'avertissement
     * @param {string} message - Message d'avertissement
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Log les informations d'export
     * @param {string} provider - Nom du provider
     * @param {Actor} actor - Acteur exporté
     * @param {Object} options - Options d'export
     * @param {Object} result - Résultat de l'export
     */
    logExport(provider, actor, options, result) {
        console.log(`📤 Export ${provider} terminé:`, {
            actor: actor.name,
            type: actor.type,
            format: options.format,
            options: options,
            result: result,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Vérifie si une bibliothèque externe est disponible
     * @param {string} libraryName - Nom de la bibliothèque
     * @returns {boolean} - True si la bibliothèque est disponible
     */
    isLibraryAvailable(libraryName) {
        switch (libraryName) {
            case 'jsPDF':
                return typeof jsPDF !== 'undefined';
            case 'html2canvas':
                return typeof html2canvas !== 'undefined';
            case 'dom-to-image':
                return typeof domtoimage !== 'undefined';
            default:
                return false;
        }
    }

    /**
     * Obtient la liste des bibliothèques manquantes
     * @param {Array<string>} requiredLibraries - Bibliothèques requises
     * @returns {Array<string>} - Bibliothèques manquantes
     */
    getMissingLibraries(requiredLibraries) {
        return requiredLibraries.filter(lib => !this.isLibraryAvailable(lib));
    }

    /**
     * Génère un message d'erreur pour les bibliothèques manquantes
     * @param {Array<string>} missingLibraries - Bibliothèques manquantes
     * @returns {string} - Message d'erreur formaté
     */
    getMissingLibrariesMessage(missingLibraries) {
        if (missingLibraries.length === 0) return '';
        
        const libNames = missingLibraries.map(lib => `**${lib}**`).join(', ');
        return `Les bibliothèques suivantes sont requises mais non disponibles : ${libNames}. Veuillez les installer pour utiliser cette fonctionnalité.`;
    }
}

// Exposer la classe globalement
window.ExportUtils = ExportUtils;
